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
            const hitSpots = row.spots.filter((spot, index) => {
                if (row.hits[index]) {
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
    // console.log(!!winners)

    useEffect(() => {
        setWinners(getContent(roundWinner))
    }, [roundWinner])

    return (
        <WinnerWrapper>
            <div className="title">round {roundWinner?.round.toNumber()} winner</div>
            <div>
                {/* <DataTable
                    theme="dark"
                    columns={columns}
                    data={winners}
                /> */}
                <WinnerTable data={winners} />
            </div>
        </WinnerWrapper>
    )
}

const WinnerWrapper = styled.div`
    width: 1140px;
    margin: auto;
    margin-top: 50px;
    height: 500px;

    .title {
        font-size: 26px;
        margin-bottom: 20px;
    }
`

const TableColumn = styled(({data, className}: {data: Winner, className?: string}) => {
    const hitSpots = data.spots.filter((spot, index) => {
        if(data.hits[index]) {
            return spot
        }
    })

    return (
        <div className={className}>
            <div className="column-wrapper">
                <div className="player">{data.player}</div>
                <div className="payout">{utils.formatEther(data.payout)}</div>
                <div className="spots">{data.spots.toString()}</div>
                <div className="hits">
                    {hitSpots.toString()}
                </div>
            </div>
        </div>
    )
})`
    .column-wrapper {
        display: flex;
        padding: 10px 0;
    }

    .player {
        width: 25%;
        margin-right: 5%;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    
    .payout, .spots, .hits {
        width: 23%;
    }
`

const WinnerTable = styled(({data, className}: {data: any, className?: string}) => {
    return (
        <div className={className}>
            <div className="header-wrapper">
                <div className="player">Player</div>
                <div className="payout">Payout</div>
                <div className="pick">Pick</div>
                <div className="hit">Hit</div>
            </div>

            <hr className="divider" />

            <div className="winner-list">
                {data.map((data: Winner) => <TableColumn data={data} />)}
            </div>
            
        </div>
    )
})`

    background-color: rgb(90, 90, 90);
    height: 300px;
    padding: 20px;
    color: white;

    .header-wrapper {
        display: flex;
        margin-bottom: 10px;
    }

    .divider {
        border-bottom: 1px solid white;
    }

    .player {
        width: 30%;
    }

    .payout, .pick, .hit {
        width: 23%;
    }

    ${TableColumn}: nth-child(odd) {
        background-color: #3A3E45;
    }

    .winner-list {
        height: 260px;
        overflow-y: scroll;
    }
`

export default RoundWinner;
