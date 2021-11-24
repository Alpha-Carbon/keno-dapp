import { useState } from 'react';
import { useKeno } from '../hooks/useKeno';

function Panel() {
    const { controller } = useKeno();
    const [btnText, setBtnText] = useState('select')
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [selectedDisplay, setSelectedDisplay] = useState('');
    const [sending, setSending] = useState(false);

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

    function sendRequest() {
        if (selectedNumbers.length === 0) return
        console.log("sendRequest", selectedNumbers)
        setSending(true)
        setInterval(() => setSending(false), 2000)
    }


    return (
        <>
            <button onClick={selectButton} disabled={!controller.ready}>{btnText}</button>
            <button onClick={sendRequest} disabled={!controller.ready || sending}>send</button>
            <p>{selectedDisplay}</p>
        </>
    );
}

export default Panel;
