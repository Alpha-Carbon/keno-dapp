import { useEffect, useState } from 'react'
import { useKeno } from '../hooks/useKeno'
import { DrawResult, GameRule } from '../utils/contract'
import { BigNumber, utils, ethers } from 'ethers'

interface DisplayProps {
    currentRoundResult: DrawResult | undefined,
    rule: GameRule | undefined,
    currentBlock: number | undefined,
    totalLiabilities: BigNumber | undefined,
    contract?: ethers.Contract
}

const Display: React.FC<DisplayProps> = ({
    currentRoundResult,
    rule,
    currentBlock,
    totalLiabilities,
    contract
}) => {
    const [round, setRound] = useState('0')
    const [roundResult, setRoundResult] = useState<DrawResult>()
    const [sending, setSending] = useState(false)
    const [countdown, setCountdown] = useState('')
    const { controller, selecting } = useKeno()

    function drawResult(result: DrawResult | undefined) {
        if (!result || !result.round || !result.draw || !rule)
            return
        let { round, draw } = result;
        let gameNumDisplay: string[];
        gameNumDisplay = ['round ' + round!.toString(),
        draw.length !== 0 ? 'block ' + round!.add(1).mul(rule.drawRate).toString() : '-',
        (currentBlock && currentBlock !== -1) ? 'block ' + currentBlock!.toString() : '-']
        controller.setGameNumber(gameNumDisplay)
        let number = []
        for (let i = 0; i < draw.length; i++) {
            number.push(draw[i].toNumber() - 1)
        }
        controller.reset({
            number,
            info: ['', '', '', '', '']
        })
    }

    useEffect(() => {
        if (!selecting) {
            setRoundResult(currentRoundResult)
            drawResult(currentRoundResult)
        }
    }, [currentRoundResult, selecting, rule, currentBlock])

    async function getResult(round: BigNumber) {
        if (!contract) return []
        let eventFilter = contract.filters.Result(round)
        let result = await contract.queryFilter(eventFilter)
        if (result.length !== 0) {
            if (result[0].args && result[0].args.length !== 0) {
                return result[0].args[1]
            }
        } else {
            return []
        }
    }

    async function handleSubmit(evt: any) {
        evt.preventDefault()
        console.log("current round", round)
        let num = parseInt(round)
        if (!isNaN(num) && num > -1) {
            setSending(true)
            let currentRound = BigNumber.from(round)
            let draw = await getResult(currentRound)
            drawResult({
                round: currentRound,
                draw,
            })
            setSending(false)
        }
    }

    function handleNumberChange(e: any) {
        let string = e.target.value
        let num = parseInt(string)
        if (string === " " || string.length === 0) {
            setRound('')
        }
        else if (!isNaN(num) && num > -1) {
            setRound(e.target.value)
        }
    }

    function minusRound() {
        let num = parseInt(round)
        if (isNaN(num)) setRound('0')
        else if (num === 0) return
        else setRound((num - 1).toString())
    }

    function plusRound() {
        let num = parseInt(round)
        if (isNaN(num)) setRound('0')
        else {
            if (roundResult && num < roundResult.round.toNumber()) {
                setRound((num + 1).toString())
            }
        }
    }

    async function currentRound() {
        if (currentBlock && currentBlock > -1) {
            setRound((~~(currentBlock / 5)).toString())
        }
    }

    useEffect(() => {
        if (!currentBlock || !rule || !rule.drawRate)
            return
        let drawRate = rule.drawRate.toNumber()
        setCountdown((drawRate - currentBlock % drawRate).toString())
    }, [currentBlock])

    return (
        <>
            <p>block to next round: {countdown}</p>
            <p>total liabilities: {totalLiabilities ? utils.formatEther(totalLiabilities) : ''}</p>
            <form onSubmit={handleSubmit}>
                <button disabled={!controller.ready || selecting || sending} onClick={currentRound}>current</button>
                <button disabled={!controller.ready || selecting || sending} onClick={minusRound}>{"<<"}</button>
                <input disabled={!controller.ready || selecting || sending} type="text" value={round} onChange={handleNumberChange}></input>
                <button disabled={!controller.ready || selecting || sending} onClick={plusRound}>{">>"}</button>
                <input disabled={!controller.ready || selecting || sending} type="submit"></input>
            </form>
        </>
    )
}

export default Display;
