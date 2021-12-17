import { useEffect, useState } from 'react'
import { Entry, RoundInfo } from '../utils/contract'
import { utils } from 'ethers'
import styled from 'styled-components'
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
        <PlayerWrapper>
            <div className="title">current round info:</div>
            <div>
                <DataTable
                    theme="dark"
                    data={entries}
                    columns={columns}
                />
            </div>
        </PlayerWrapper>
    )
}

const PlayerWrapper = styled.div`
    margin: 50px auto;

    .title {
        font-size: 26px;
        margin: 50px 0 20px 0;
    }
`

export default CurrentRoundPlayer
