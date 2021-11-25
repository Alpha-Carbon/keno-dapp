import { useEffect, useState } from 'react'
import { DrawResult, GameRule, getResult } from '../utils/contract'
import { BigNumber, utils, ethers } from 'ethers'
import { KenoController } from '../keno/kenoType'

interface DisplayProps {
    currentRoundResult: DrawResult | undefined,
    rule: GameRule | undefined,
    currentBlock: number | undefined,
    totalLiabilities: BigNumber | undefined,
    contract?: ethers.Contract,
    //
    keno: KenoController,
    selecting: boolean
}

const Display: React.FC<DisplayProps> = ({
    currentRoundResult,
    rule,
    currentBlock,
    totalLiabilities,
    contract,
    keno,
    selecting
}) => {
    const [round, setRound] = useState('0')
    const [roundResult, setRoundResult] = useState<DrawResult>()
    const [sending, setSending] = useState(false)
    const [countdown, setCountdown] = useState('')

    function drawResult(result: DrawResult | undefined) {
        if (!result || !result.round || !result.draw || !rule)
            return
        let renderRound = result.round
        let renderDraw = result.draw
        let gameNumDisplay: string[]
        gameNumDisplay = ['round ' + renderRound!.toString(),
        renderDraw.length !== 0 ? 'block ' + renderRound!.add(1).mul(rule.drawRate).toString() : '-',
        (currentBlock && currentBlock !== -1) ? 'block ' + currentBlock!.toString() : '-']
        keno.setGameNumber(gameNumDisplay)
        let number = []
        for (let i = 0; i < renderDraw.length; i++) {
            number.push(renderDraw[i].toNumber() - 1)
        }
        keno.reset({
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

    async function handleSubmit(evt: any) {
        evt.preventDefault()
        console.log("current round", round)
        let num = parseInt(round)
        if (!isNaN(num) && num > -1) {
            setSending(true)
            let currentRound = BigNumber.from(round)
            let draw = await getResult(contract, currentRound)
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
        if (rule && currentBlock && currentBlock > -1) {
            setRound((~~(currentBlock / rule.drawRate.toNumber())).toString())
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
                <button disabled={!keno.ready || selecting || sending} onClick={currentRound}>current</button>
                <button disabled={!keno.ready || selecting || sending} onClick={minusRound}>{"<<"}</button>
                <input disabled={!keno.ready || selecting || sending} type="text" value={round} onChange={handleNumberChange}></input>
                <button disabled={!keno.ready || selecting || sending} onClick={plusRound}>{">>"}</button>
                <input disabled={!keno.ready || selecting || sending} type="submit"></input>
            </form>
        </>
    )
}

export default Display;
