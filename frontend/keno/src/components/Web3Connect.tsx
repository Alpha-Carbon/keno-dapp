import React from 'react'

import useWeb3 from '../hooks/useWeb3'
import { RINKEBY } from '../config'

import styled from 'styled-components'

const Web3Connect: React.FC = () => {
    const [{ address, network, onboard, ens }, { disconnect }] = useWeb3()

    const buttonContent = address
        ? ens?.name
            ? ens.name
            : shorten(address)
        : 'Connect'

    const isConnected = !!address
    return (
        <Web3Wrapper>
            {network && network === RINKEBY ? <p>(Rinkeby)</p> : null}

            <Button
                disabled={isConnected}
                key="connect"
                onClick={async () => {
                    if (await onboard?.walletSelect())
                        await onboard?.walletCheck()
                }}
            >
                {buttonContent}
            </Button>
            {isConnected && (
                <Button
                    key="disconnect"
                    onClick={async () => {
                        disconnect()
                    }}
                >
                    Disconnect
                </Button>
            )}
        </Web3Wrapper>
    )
}

function shorten(address: string | null | undefined) {
    if (!address) return ''
    return address.slice(0, 5) + '...' + address.slice(-2)
}

const Web3Wrapper = styled.div`
    text-align: right;
`

const Button = styled.button`
    padding: 5px 10px;
    background-color: white;
    font-size: 18px;
    margin-left: 10px;
`

export default Web3Connect
