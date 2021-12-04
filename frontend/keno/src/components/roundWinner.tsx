import { useEffect, useState } from 'react'
import { RoundWinners, Winner } from '../utils/contract'
import { utils } from 'ethers'

import styled from 'styled-components'
import DataTable from 'react-data-table-component'

interface RoundWinnerProps {
    roundWinner?: RoundWinners,
}

const columns = [
    {
        name: 'Player',
        selector: (row: Winner) => row.player.toString()
    },
    {
        name: 'Payout',
        selector: (row: Winner) => utils.formatEther(row.payout)
    },
    {
        name: 'Pick',
        selector: (row: Winner) => row.spots.toString()
    },
    {
        name: 'Hit',
        selector: (row: Winner) => {
            const hitSpots = row.spots.filter((spot,index) => {
                if(row.hits[index]) {
                    return spot
                }
            })
            return hitSpots.toString()
        }
    }
]

const RoundWinner: React.FC<RoundWinnerProps> = ({
    roundWinner,
}) => {
    const [winners, setWinners] = useState<Winner[]>([])

    function getContent(roundWinner?: RoundWinners) {
        if (!roundWinner) return []
        return roundWinner.winners
    }
    console.log(!!winners)

    useEffect(() => {
        setWinners(getContent(roundWinner))
    }, [roundWinner])

    return (
        <WinnerWrapper>
            <div className="title">round {roundWinner?.round.toNumber()} winner</div>
            <div>
                <DataTable
                    theme="dark"
                    columns={columns}
                    data={winners}
                />
            </div>
        </WinnerWrapper>
    )
}

const WinnerWrapper = styled.div`
    width: 90vw;
    margin: auto;
    margin-top: 50px;

    .title {
        font-size: 26px;
        margin-bottom: 20px;
    }
`

export default RoundWinner;
