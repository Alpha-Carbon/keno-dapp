import { ethers, BigNumber } from 'ethers'

export interface GameRule {
    drawRate: BigNumber
    spots: BigNumber
    startBlock: BigNumber
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

    return {
        drawRate,
        spots,
        startBlock,
    }
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
        contract.getRoundObj(round),
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