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
    player: string,
    picks: BigNumber[],
    value: BigNumber,
    maxPayout: BigNumber,
}

export interface Round {
    entries: Entry[]
    resolved: boolean
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
    console.log('game rule:')
    console.log('drawRate', rule.drawRate.toNumber())
    console.log('spots', rule.spots.toNumber())
    console.log('startBlock', rule.startBlock.toNumber())
    console.log('startRound', rule.startRound.toNumber())
    return rule
}

export interface ContractState {
    draw: BigNumber[]
    round: Round
}

export async function getContractState(
    contract: ethers.Contract,
    round: BigNumber
): Promise<ContractState> {
    // console.log('querying contract...')
    const [draw, roundResult] = await Promise.all([
        getResult(contract, round),
        contract.getRound(round),
    ])

    return {
        draw, round: roundResult
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

export function blockToRound(block: number, drawRate: number): number {
    return ~~(block / drawRate)
}