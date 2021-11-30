import { useEffect, useState } from 'react'
import { DrawResult, GameRule, getResult, blockToRound } from '../utils/contract'
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
    const [round, setRound] = useState('')
    const [roundResult, setRoundResult] = useState<DrawResult>()
    const [sending, setSending] = useState(false)
    const [countdown, setCountdown] = useState('')
    const [legalRange, setLegalRange] = useState<number[]>()

    ///// collector
    // useEffect(() => {
    //     if (legalRange && legalRange.length > 1) {
    //         let request = []
    //         for (let i = legalRange[0]; i < legalRange[1]; i++) {
    //             request.push(getResult(contract, BigNumber.from(i)))
    //         }
    //         Promise.all(request).then(v => {
    //             for (let i = 0; i < v.length; i++) {
    //                 console.log(legalRange[0] + i, v[i].map(v => v.toNumber()))
    //             }
    //         })
    //     }
    // }, [legalRange])

    function renderGameNumber(result: DrawResult | undefined) {
        if (!result || !result.round || !result.draw || !rule)
            return
        let renderRound = result.round
        let renderDraw = result.draw
        let gameNumDisplay = ['round ' + renderRound!.toString(),
        renderDraw.length !== 0 ? 'block ' + renderRound!.add(1).mul(rule.drawRate).toString() : '-',
        (currentBlock && currentBlock !== -1) ? 'block ' + currentBlock!.toString() : '-']
        keno.setGameNumber(gameNumDisplay)
    }

    function renderResult(result: DrawResult | undefined, animation: boolean) {
        if (!result || !result.round || !result.draw || !rule)
            return
        let number: number[] = []
        let renderDraw = result.draw
        for (let i = 0; i < renderDraw.length; i++) {
            number.push(renderDraw[i].toNumber() - 1)
        }
        let renderResult = {
            number,
            info: ['', '', '', '', '']
        }
        if (animation) {
            if (!keno.setTime(0))
                console.log('set time failed')
            setTimeout(() => {
                if (!keno.stop(renderResult))
                    console.log('stop failed')
            }, 1000)
        } else {
            keno.reset(renderResult)
        }
    }

    useEffect(() => {
        if (rule && currentBlock) {
            let currentRound = blockToRound(currentBlock, rule.drawRate.toNumber())
            let stratRound = rule.startRound.toNumber()
            renderGameNumber(roundResult)
            if (!legalRange
                || (legalRange[0] !== stratRound || legalRange[1] !== currentRound)
            ) {
                setLegalRange([stratRound, currentRound])
            }
        }
    }, [rule, currentBlock])

    useEffect(() => {
        if (!currentBlock || !rule || !rule.drawRate)
            return
        let drawRate = rule.drawRate.toNumber()
        setCountdown((drawRate - currentBlock % drawRate).toString())
        if (round === '') {
            setRound(blockToRound(currentBlock, rule.drawRate.toNumber()).toString())
        }
    }, [currentBlock, rule])

    useEffect(() => {
        if (!currentRoundResult) return
        if (!selecting) {
            renderResult(currentRoundResult, (roundResult !== undefined && !roundResult.round.eq(currentRoundResult.round)))
            renderGameNumber(currentRoundResult)
        }
        setRoundResult(currentRoundResult)
    }, [currentRoundResult])

    useEffect(() => {
        if (!selecting) {
            renderResult(currentRoundResult, false)
            renderGameNumber(currentRoundResult)
        }
    }, [selecting])


    async function handleSubmit(evt: any) {
        evt.preventDefault()
        if (!legalRange) return
        let requestRound = round
        let num = parseInt(round)
        if (!isNaN(num) && num > -1) {
            if (num < legalRange[0]) {
                requestRound = legalRange[0].toString()
                setRound(requestRound)
            } else if (num > legalRange[1]) {
                requestRound = legalRange[1].toString()
                setRound(requestRound)
            }
            setSending(true)
            let currentRound = BigNumber.from(requestRound)
            let draw = await getResult(contract, currentRound)
            renderResult({
                round: currentRound,
                draw,
            }, false)
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
        if (!legalRange) return
        let num = parseInt(round)
        if (isNaN(num)) setRound('0')
        else if (num === 0 || num === legalRange[0]) return
        else setRound((num - 1).toString())
    }

    function plusRound() {
        if (!legalRange) return
        let num = parseInt(round)
        if (isNaN(num)) setRound('0')
        else {
            if (roundResult && num < legalRange[1]) {
                setRound((num + 1).toString())
            }
        }
    }

    async function currentRound() {
        if (rule && currentBlock && currentBlock > -1) {
            setRound(blockToRound(currentBlock, rule.drawRate.toNumber()).toString())
        }
    }

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
