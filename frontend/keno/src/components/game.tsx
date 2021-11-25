import { useState } from 'react';
import { Result } from '../types'
import { BigNumber, ethers } from 'ethers'
import { GameRule } from '../utils/contract'
import { KenoController } from '../keno/kenoType'

interface GameProps {
    rule: GameRule | undefined,
    account?: string | null
    contract?: ethers.Contract
    currentBlock?: number,
    readyToTransact: () => Promise<boolean>
    //
    keno: KenoController
}

const Game: React.FC<GameProps> = ({
    rule,
    account,
    contract,
    currentBlock,
    readyToTransact,
    keno,
}) => {
    const [btnText, setBtnText] = useState('select')
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [selectedDisplay, setSelectedDisplay] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<Result>()

    function selectButton() {
        // console.log('ready?', ready)
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
            let res = await contract!.play(((~~(currentBlock / drawRate) + 1) * drawRate), selectedNum, {
                value: await contract!.MINIMUM_PLAY(),
            })

            console.log('play result:', res)
            setResult({
                message: `Play Transaction Sent, Tx Hash: ${res.hash}`,
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
        <>
            <button onClick={selectButton} disabled={!keno.ready}>{btnText}</button>
            <button onClick={sendRequest} disabled={!keno.ready || sending}>send</button>
            <p>selected: {selectedDisplay}</p>
            <p>result: {result?.message}</p>
        </>
    );
}

export default Game;
