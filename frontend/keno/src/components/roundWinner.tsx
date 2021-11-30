import { useEffect, useState } from 'react'
import { RoundWinners } from '../utils/contract'
import { utils } from 'ethers'

interface RoundWinnerProps {
    roundWinner?: RoundWinners,
}

const RoundWinner: React.FC<RoundWinnerProps> = ({
    roundWinner,
}) => {
    const [winners, setWinners] = useState<JSX.Element[]>([])

    function getContent(roundWinner?: RoundWinners) {
        if (!roundWinner) return []
        let newWinners = []
        for (let i = 0; i < roundWinner.winners.length; i++) {
            let { player, spots, hits, payout, } = roundWinner.winners[i]
            let hitNumbers = []
            for (let i = 0; i < spots.length; i++) {
                if (hits[i]) {
                    hitNumbers.push(spots[i])
                }
            }
            newWinners.push(<li key={i}>{player + " wins " + utils.formatEther(payout) + ' ether | picks: [' + spots.toString() + '] | hits: [' + hitNumbers.toString() + ']'}</li>)
        }
        return newWinners
    }

    useEffect(() => {
        setWinners(getContent(roundWinner))
    }, [roundWinner])

    return (
        <>
            <p>round {roundWinner?.round.toNumber()} winner</p>
            <ul>
                {winners}
            </ul>
        </>
    )
}

export default RoundWinner;
