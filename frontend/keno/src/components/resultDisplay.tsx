import { useEffect, useState } from 'react'
import { useKeno } from '../hooks/useKeno'
import useWeb3 from '../hooks/useWeb3'
import { DrawResult } from '../utils/contract'
import { SelectEvent } from '../keno/kenoContext'
import { BigNumber } from 'ethers'

function History() {
    const [round, setRound] = useState('0')
    const [roundResult, setRoundResult] = useState<DrawResult>()
    const [sending, setSending] = useState(false)
    const [countdown, setCountdown] = useState('')
    const { controller, selecting } = useKeno()
    const [
        { currentRoundResult, contract, defaultContract, getResult, rule, currentBlock },
        actions,
    ] = useWeb3()

    function drawResult(result: DrawResult | undefined) {
        if (!result || !result.round || !result.draw || !rule)
            return
        let { round, draw } = result;
        let gameNumDisplay: string[];
        if (round) {
            gameNumDisplay = ['round ' + round.toString(),
            draw.length !== 0 ? 'block ' + round.add(1).mul(rule.drawRate).toString() : '-']
        } else {
            gameNumDisplay = ['', '']
        }
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
    }, [currentRoundResult, selecting])

    // useEffect(() => {
    //     if (!selecting) {
    //         drawResult(roundResult)
    //     }
    // }, [selecting])

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

    function currentRound() {
        if (roundResult) {
            setRound(roundResult.round.toString())
        }
    }

    useEffect(() => {
        if (!currentBlock || !rule || !rule.drawRate)
            return
        let drawRate = rule.drawRate.toNumber()
        setCountdown('block: ' + (drawRate - currentBlock % drawRate).toString())
    }, [currentBlock])
    // function blockCountdown(drawRate: BigNumber | undefined) {

    // }

    return (
        <>
            <p>block: {countdown}</p>
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

export default History;
