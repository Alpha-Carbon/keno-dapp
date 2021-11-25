import { useEffect, useState } from 'react'
import { Round } from '../utils/contract'
import { utils } from 'ethers'

interface ListProps {
    round?: Round,
}

const List: React.FC<ListProps> = ({
    round,
}) => {
    const [entries, setEntries] = useState<JSX.Element[]>([])

    function getContent(round?: Round) {
        if (!round) return []
        let newEntries = []
        for (let i = 0; i < round.entries.length; i++) {
            let { player, value } = round.entries[i]
            newEntries.push(<li key={i}>{player + " => " + utils.formatEther(value) + ' ether'}</li>)
            console.log(i, player, value.toString())
        }
        console.log("newEntries", newEntries)
        return newEntries
    }

    useEffect(() => {
        console.log("List", round)
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
