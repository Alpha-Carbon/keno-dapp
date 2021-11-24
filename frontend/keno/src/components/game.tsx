import { useState } from 'react';
import { useKeno } from '../hooks/useKeno'
import { Result } from '../types'
import { BigNumber, ethers, utils } from 'ethers'

interface GameProps {
    account?: string | null
    contract?: ethers.Contract
    currentBlock?: number,
    readyToTransact: () => Promise<boolean>
}

const Game: React.FC<GameProps> = ({
    account,
    contract,
    currentBlock,
    readyToTransact
}) => {
    const { controller } = useKeno();
    const [btnText, setBtnText] = useState('select')
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [selectedDisplay, setSelectedDisplay] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<Result>()

    function selectButton() {
        // console.log('ready?', ready)
        if (!controller.ready) return
        if (controller.reverseSelect()) {
            controller.setSelectMode()
            setBtnText('done')
            setSending(true)
        } else {
            controller.reset({
                number: [],
                info: ['', '', '', '', '']
            });

            setBtnText('select')
            setSending(false)
            let selected = controller.getSelected()
            setSelectedNumbers(selected)
            setSelectedDisplay(selected.toString())
        }
    }

    const sendRequest = async () => {
        let ready = await readyToTransact()
        if (!ready || !contract || selectedNumbers.length === 0 || !currentBlock) return

        setSending(true)
        try {
            let selectedNum = selectedNumbers.map(v => BigNumber.from(v))

            console.log('spots', selectedNum.length)
            let res = await contract!.play(((~~(currentBlock / 5) + 1) * 5), selectedNum, {
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
    // const sendWithdraw = async () => {
    //     let ready = await readyToTransact()
    //     if (!ready || !contract || !account) return

    //     setSending(true)
    //     try {
    //         let selectedNum = selectedNumbers.map(v => BigNumber.from(v))

    //         let res = await contract!.withdraw(account)

    //         console.log('play result:', res)
    //         setResult({
    //             message: `Play Transaction Sent, Tx Hash: ${res.hash}`,
    //         })
    //     } catch (e: any) {
    //         console.log(`tx response: ${e.message}`)
    //         setResult({
    //             message: `Play Transaction Error: ${e.message}`,
    //             err: e as Error,
    //         })
    //     }
    //     setSending(false)
    // }


    return (
        <>
            <button onClick={selectButton} disabled={!controller.ready}>{btnText}</button>
            <button onClick={sendRequest} disabled={!controller.ready || sending}>send</button>
            {/* <button onClick={sendWithdraw} disabled={!controller.ready || sending}>withdraw</button> */}
            <p>selected: {selectedDisplay}</p>
            <p>result: {result?.message}</p>
        </>
    );
}

export default Game;
