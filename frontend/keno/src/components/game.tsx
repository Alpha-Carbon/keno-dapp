import { useState } from 'react';
import { Result } from '../types'
import { BigNumber, ethers } from 'ethers'
import { GameRule, blockToRound } from '../utils/contract'
import { KenoController } from '../keno/kenoType'
import styled from 'styled-components'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useKeno } from '../hooks/useKeno'

interface GameProps {
    rule: GameRule | undefined,
    account?: string | null
    contract?: ethers.Contract
    currentBlock?: number,
    readyToTransact: () => Promise<boolean>
    //
    keno: KenoController
    className?: string
}

const Game: React.FC<GameProps> = ({
    rule,
    account,
    contract,
    currentBlock,
    readyToTransact,
    keno,
    className
}) => {
    const [btnText, setBtnText] = useState('select')
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [selectedDisplay, setSelectedDisplay] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<Result>()

    const {selecting} = useKeno()

    function selectButton() {
        if (!keno.ready) return
        if (keno.reverseSelect()) {
            keno.setSelectMode()
            setBtnText('done')
            setSending(true)
        } else {
            keno.reset({
                number: [],
                info: ['', '', '', '', '']
            });

            setBtnText('select')
            setSending(false)
            let selected = keno.getSelected()
            setSelectedNumbers(selected)
            setSelectedDisplay(selected.toString())
        }
    }

    const sendRequest = async () => {
        let ready = await readyToTransact()
        if (!ready || !contract || selectedNumbers.length === 0 || !currentBlock || !rule) return

        setSending(true)
        try {
            let selectedNum = selectedNumbers.map(v => BigNumber.from(v))

            let drawRate = rule!.drawRate.toNumber()
            let forBlock = (blockToRound(currentBlock, drawRate) + 1) * drawRate
            let res = await contract!.play(forBlock, selectedNum, {
                value: await contract!.MINIMUM_PLAY(),
            })

            toast('send successfully')

            setResult({
                message: `Play Transaction Sent, Tx Hash: ${forBlock} | ${res.hash}`,
            })
        } catch (e: any) {
            console.log(`tx response: ${e.message}`)
            setResult({
                message: `Play Transaction Error: ${e.message}`,
                err: e as Error,
            })
        }
        setSending(false)
    }

    return (
        <GameWrapper className={className}>
            <div className="select">
                
                {selecting ? 
                    (<div>selecting</div>) 
                    : (<div className="select-display">selected: {selectedDisplay}</div>)
                }
                
            </div>
            
            <Button onClick={selectButton} disabled={!keno.ready}>{btnText}</Button>
            <Button onClick={sendRequest} disabled={!keno.ready || sending}>send</Button>
            <ToastContainer
                position="top-center"
            />
        </GameWrapper>
    );
}

const GameWrapper = styled.div`
    color: white;
    font-size: 20px;

    .select {
        display: flex;
        gap: 10px;
        margin: 20px 0;
    }

    .result {
        margin: 20px 0;
    }
`

const Button = styled.button`
    padding: 5px 10px;
    background-color: white;
    font-size: 18px;
    cursor: pointer

    &: hover {
        background-color: lightblue;
    }
`

export default Game;
