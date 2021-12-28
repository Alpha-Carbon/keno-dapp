import { useEffect, useState } from 'react'
import { Entry, RoundInfo } from '../utils/contract'
import { utils } from 'ethers'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserFriends } from '@fortawesome/free-solid-svg-icons'
import DataTable from 'react-data-table-component'

interface CurrentRoundPlayerProps {
    round?: RoundInfo,
}

const columns = [
    {
        name: 'Player',
        selector: (row: Entry) => row.player.toString()
    },
    {
        name: 'value',
        selector: (row: Entry) => utils.formatEther(row.value)
    }
]

const mockdata = [
    {player: "dddddd",value: 20},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25}
    ,{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25}
    ,{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25}
    ,{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25},{player: "aaaaaa",value: 25}
]

const CurrentRoundPlayer: React.FC<CurrentRoundPlayerProps> = ({
    round,
}) => {
    const [entries, setEntries] = useState<Entry[]>([])

    function getContent(round?: RoundInfo) {
        // if (!round) return []
        // let newEntries = []
        // for (let i = 0; i < round.entries.length; i++) {
        //     let { player, value } = round.entries[i]
        //     newEntries.push(<li key={i}>{player + " => " + utils.formatEther(value) + ' ether'}</li>)
        // }
        // return newEntries
        if(!round) return []
        return round.entries
    }

    useEffect(() => {
        setEntries(getContent(round))
    }, [round])

    return (
        <>
            <PlayerTable data={entries} />
        </>
    )
}

function PlayerTable({data}: {data: any}) {
    return (
        <TableWrapper>
            <div className="header">
                <div className="player">PLAYER</div>
                <div className="value">VALUE</div>
            </div>
            <hr className="divider" />
            <div className="player-list">
                {data.map((player: any) => (
                    <div className="column">
                        <div className="player-field">{player.player}</div>
                        <div className="value-field">{utils.formatEther(player.value)}</div>
                    </div>
                ))}
            </div>
        </TableWrapper>
    )
}

const TableWrapper = styled.div`

    border-radius: 20px;
    padding: 10px;
    background-color: rgb(90, 90, 90);
    color: white;

    .header {
        display: flex;
        font-size: 15px;

        .player {
            width: 65%;
        }

        .value {
            width: 35%;
        }
    }

    .divider {
        border-bottom: 1px solid white;
    }
    
    .player-list {
        color: white;
        height: 435px;
        overflow-y: scroll;
        
        .column {
            display: flex;
            padding: 10px 5px;
            gap: 5%;
        }
        
        .player-field {
            width: 60%;
            text-overflow: ellipsis;
            overflow: hidden;
        }

        .value-field {
            width: 35%;
            text-overflow: ellipsis;
            overflow: hidden;
        }

        .column: nth-child(odd) {
            background-color: #3A3E45;
        }

    }
`

export default CurrentRoundPlayer
