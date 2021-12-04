import { ethers, BigNumber } from 'ethers'

export interface GameRule {
    drawRate: BigNumber
    spots: BigNumber
    startBlock: BigNumber
    startRound: BigNumber
}

export interface DrawResult {
    round: BigNumber
    draw: BigNumber[]
}


export interface Entry {
    player: string
    picks: BigNumber[]
    value: BigNumber
    maxPayout: BigNumber
}

export interface RoundInfo {
    entries: Entry[]
    resolved: boolean
    round: BigNumber
}

export interface Winner {
    player: String
    spots: number[]
    hits: boolean[]
    payout: BigNumber
}

export interface RoundWinners {
    round: BigNumber
    winners: Winner[]
}

export async function getGameRule(
    contract: ethers.Contract
): Promise<GameRule> {
    // console.log('querying contract...')
    const [drawRate, spots, startBlock] = await Promise.all([
        contract.DRAW_RATE(),
        contract.SPOTS(),
        contract.startBlock(),
    ])

    let rule = {
        drawRate,
        spots,
        startBlock,
        startRound: startBlock.div(drawRate).add(1)
    }
    console.log('game rule:', {
        drawRate: rule.drawRate.toNumber(),
        spots: rule.spots.toNumber(),
        startBlock: rule.startBlock.toNumber(),
        startRound: rule.startRound.toNumber(),
    })
    return rule
}

export interface ContractState {
    draw: BigNumber[]
    round: RoundInfo
}

export async function getContractState(
    contract: ethers.Contract,
    round: BigNumber
): Promise<ContractState> {
    // console.log('querying contract...')
    const [draw, roundResult] = await Promise.all([
        getResult(contract, round),
        getRound(contract, round.add(1)),
    ])

    return {
        draw, round: roundResult!
    }
}

export async function getRound(
    contract: ethers.Contract,
    round: BigNumber
): Promise<RoundInfo | undefined> {

    //#TODO use real getter here
    //#HACK the getter need to be implemented in contract, it was `getRound`
    let result = await contract.getRound(round)
    if (result && result.length > 1) {
        return {
            round,
            entries: result[0],
            resolved: result[1]
        }
    } else {
        return undefined
    }
}

export async function getResult(
    contract: ethers.Contract | undefined,
    round: BigNumber
): Promise<BigNumber[]> {
    if (!contract) return []
    let eventFilter = contract.filters.Result(round)
    let result = await contract.queryFilter(eventFilter)
    if (result.length !== 0) {
        if (result[0].args && result[0].args.length !== 0) {
            return result[0].args[1]
        }
    }
    return []
}

export async function getWinners(
    contract: ethers.Contract | undefined,
    round: BigNumber
): Promise<RoundWinners | undefined> {
    if (!contract) return undefined
    const eventFilter = contract.filters.EntryWins(round)
    const winnersEvt = await contract.queryFilter(eventFilter)
    let winners: Winner[] = []
    if (winnersEvt.length !== 0) {
        winners = winnersEvt.map(v => {
            let data = v.args!;
            return {
                player: data.player,
                spots: data.spots.map((v: BigNumber) => v.toNumber()),
                hits: data.hits,
                payout: data.payout,
            }
        })
    }
    return {
        round,
        winners
    }
}

export function blockToRound(block: number, drawRate: number): number {
    return ~~(block / drawRate)
}