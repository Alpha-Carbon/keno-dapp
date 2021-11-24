import React from 'react'

import useWeb3 from '../hooks/useWeb3'
import { RINKEBY } from '../config'

const Web3Connect: React.FC = () => {
    const [{ address, network, onboard, ens }, { disconnect }] = useWeb3()

    const buttonContent = address
        ? ens?.name
            ? ens.name
            : shorten(address)
        : 'Connect'

    const isConnected = !!address
    return (
        <>
            {network && network === RINKEBY ? <p>(Rinkeby)</p> : null}

            <button
                disabled={isConnected}
                key="connect"
                onClick={async () => {
                    if (await onboard?.walletSelect())
                        await onboard?.walletCheck()
                }}
            >
                {buttonContent}
            </button>
            {isConnected && (
                <button
                    key="disconnect"
                    onClick={async () => {
                        disconnect()
                    }}
                >
                    Disconnect
                </button>
            )}
        </>
    )
}

function shorten(address: string | null | undefined) {
    if (!address) return ''
    return address.slice(0, 5) + '...' + address.slice(-2)
}

export default Web3Connect
