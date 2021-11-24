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