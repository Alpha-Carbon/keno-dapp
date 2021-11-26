import { useEffect, useState } from 'react'
import { RoundInfo } from '../utils/contract'
import { utils } from 'ethers'

interface ListProps {
    round?: RoundInfo,
}

const List: React.FC<ListProps> = ({
    round,
}) => {
    const [entries, setEntries] = useState<JSX.Element[]>([])

    function getContent(round?: RoundInfo) {
        if (!round) return []
        let newEntries = []
        for (let i = 0; i < round.entries.length; i++) {
            let { player, value } = round.entries[i]
            newEntries.push(<li key={i}>{player + " => " + utils.formatEther(value) + ' ether'}</li>)
        }
        return newEntries
    }

    useEffect(() => {
        setEntries(getContent(round))
    }, [round])

    return (
        <>
            <p>current round info:</p>
            <ul>
                {entries}
            </ul>
        </>
    )
}

export default List;
