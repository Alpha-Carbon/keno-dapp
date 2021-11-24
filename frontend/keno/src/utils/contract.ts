import { ethers, BigNumber } from 'ethers'

export interface GameRule {
    drawRate: BigNumber
    spots: BigNumber
}

export interface DrawResult {
    round: BigNumber
    draw: BigNumber[]
}

export async function getGameRule(
    contract: ethers.Contract
): Promise<GameRule> {
    // console.log('querying contract...')
    const [drawRate, spots] = await Promise.all([
        contract.DRAW_RATE(),
        contract.SPOTS(),
    ])

    return {
        drawRate,
        spots,
    }
}