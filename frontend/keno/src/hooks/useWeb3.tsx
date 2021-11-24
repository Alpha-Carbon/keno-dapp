import React, {
    useEffect,
    useContext,
    useState,
    Dispatch,
    SetStateAction,
    useCallback,
} from 'react'
import { ethers, providers, BigNumber } from 'ethers'
import { API, Wallet, Ens } from 'bnc-onboard/dist/src/interfaces'

import { getGameRule, DrawResult, GameRule } from '../utils/contract'
import { initOnboard } from '../utils/initOnboard'
import Abi from '../abi/KenoAbi.json'
import Config, { AMINO } from '../config'
import { Address } from 'cluster'

interface ContextData {
    address?: string
    ens?: Ens
    network?: number
    balance?: string
    wallet?: Wallet
    onboard?: API
    rule?: GameRule,
    currentBlock?: number,
    currentRoundResult?: DrawResult
    contract?: ethers.Contract
    defaultContract: ethers.Contract
    totalLiabilities?: BigNumber,
}

interface ContextActions {
    ready: () => Promise<boolean> // function as property declaration
    disconnect: () => void
}

type Context = [ContextData, ContextActions]

let defaultProvider: providers.JsonRpcProvider = new providers.JsonRpcProvider('http://localhost:19932')
let defaultContract = new ethers.Contract(
    Config(AMINO).contractAddress!,
    Abi,
    defaultProvider
)
let provider: providers.JsonRpcProvider | undefined
const Web3Context = React.createContext<Context>([
    { defaultContract },
    {
        ready: async () => {
            return false
        },
        disconnect: () => { },
    },
])
export const Web3Provider: React.FC<{}> = ({ children }) => {
    const [address, setAddress] = useState<string>()
    const [ens, setEns] = useState<Ens>()
    const [network, setNetwork] = useState<number>()
    const [balance, setBalance] = useState<string>()
    const [wallet, setWallet] = useState<Wallet>()
    const [onboard, setOnboard] = useState<API>()
    const [activeContract, setActiveContract] = useState<ethers.Contract>()
    const [currentBlock, setCurrentBlock] = useState<number>()
    const [initFinished, setInitFinished] = useState(false)


    const [rule, setRule] = useState<GameRule>()
    const [currentRoundResult, setCurrentRoundResult] = useState<DrawResult>()
    const [totalLiabilities, setTotalLiabilities] = useState<BigNumber>()

    //callback anchors
    // const contractStateRef = useRef<ContractState>()
    // contractStateRef.current = contractState
    // const getCurrentState = () => {
    //     return contractStateRef.current
    // }

    useEffect(() => {
        const onboard = initOnboard({
            address: setAddress,
            // ens: setEns,
            network: setNetwork,
            balance: setBalance,
            wallet: (wallet: Wallet) => {
                // console.log('wallet set')
                if (wallet.provider) {
                    setWallet(wallet)
                    provider = new ethers.providers.Web3Provider(
                        wallet.provider
                    )

                    window.localStorage.setItem('selectedWallet', wallet.name!)
                } else {
                    provider = undefined
                    setActiveContract(undefined)
                    setWallet(undefined)
                }
            },
        })
        setOnboard(onboard)

            // Get contract data and setup listeners on default contract
            ; (async () => { setRule(await getGameRule(defaultContract)) })()
        subscribeContractEvents(defaultProvider, defaultContract, setCurrentRoundResult, true)
        subscribeBlock(defaultProvider, defaultContract)

    }, [])

    useEffect(() => {
        const previouslySelectedWallet = window.localStorage.getItem(
            'selectedWallet'
        )
        if (previouslySelectedWallet && onboard) {
            ; (async () => {
                await onboard.walletSelect(previouslySelectedWallet)
                await onboard.walletCheck()
            })()
        }
    }, [onboard])

    useEffect(() => {
        ; (async () => {
            console.log('network changed: ', network)
            if (!initFinished || !network || !onboard) return

            onboard.config({ networkId: network })
            defaultContract.removeAllListeners()
            defaultProvider.removeAllListeners()
            defaultProvider = new providers.JsonRpcProvider('http://localhost:19932')
            defaultContract = new ethers.Contract(
                Config(network).contractAddress!,
                Abi,
                defaultProvider
            )

                // Get contract data and setup listeners on default contract
                ; (async () => { setRule(await getGameRule(defaultContract)) })()
            subscribeContractEvents(defaultProvider, defaultContract, setCurrentRoundResult, false)
            subscribeBlock(defaultProvider, defaultContract)


            if (wallet) {
                let p: providers.JsonRpcProvider = new ethers.providers.Web3Provider(
                    wallet.provider
                )
                // console.log('resetting contract', provider.getSigner())
                // console.log('wallet provider', wallet!.provider)
                // console.log('wallet signer', wallet!.provider.getSigner)
                let activeContract = new ethers.Contract(
                    Config(network).contractAddress!,
                    Abi,
                    p.getSigner()
                )
                console.log(activeContract)
                setActiveContract(activeContract)
            }
            setNetwork(network)
        })()
    }, [initFinished, onboard, network, wallet])

    // console.log(wallet?.provider)

    async function readyToTransact() {
        if (!provider) {
            //#HACK if provider is set, onboard should be set.
            const walletSelected = await onboard!.walletSelect()
            if (!walletSelected) return false
        }

        return await onboard!.walletCheck()
    }

    async function subscribeContractEvents(
        provider: providers.JsonRpcProvider,
        contract: ethers.Contract,
        setCurrentRoundResult: Dispatch<SetStateAction<DrawResult | undefined>>,
        init: boolean
    ) {
        let initRound = BigNumber.from(~~(provider.blockNumber / 5))
        console.log("blockNumber", provider.blockNumber)
        console.log("try get round:", initRound)
        let initDraw = await getResult(initRound)
        contract.on('Result', async (currentRound: BigNumber, currentDraw: BigNumber[]) => {
            if (!currentRoundResult || currentRoundResult.round < currentRound) {
                setCurrentRoundResult({ round: currentRound, draw: currentDraw })
            }
        })
        // contract.on('NewEntry',async() => {

        // } )
        contract.on('EntryWins', async (currentRound: BigNumber, player: Address, spots: BigNumber[], hits: boolean[], payout: BigNumber) => {
            console.log('winner', currentRound, player, spots, hits, payout)
        })

        if (initDraw && initDraw.length !== 0)
            setCurrentRoundResult({ round: initRound, draw: initDraw })
        console.log("subscribeContractEvents end")
        if (init) setInitFinished(true)
    }

    function subscribeBlock(
        provider: providers.JsonRpcProvider,
        contract: ethers.Contract,
    ) {
        if (provider.blockNumber) {
            setCurrentBlock(provider.blockNumber)
        }
        provider.on('block', async (block) => {
            if (!currentBlock || currentBlock < block) {
                setCurrentBlock(block)
            }
            if (!currentRoundResult) {
                let round = BigNumber.from(~~(block / 5))
                let draw = await getResult(round)
                if (draw.length !== 0)
                    setCurrentRoundResult({ round: round, draw: draw })
            }
            setTotalLiabilities(await contract.totalLiabilities())
        })
    }


    const getResult = useCallback(async (round: BigNumber) => {
        try {
            let eventFilter = defaultContract.filters.Result(round)
            let result = await defaultContract.queryFilter(eventFilter)
            if (result.length !== 0) {
                if (result[0].args && result[0].args.length !== 0) {
                    return result[0].args[1]
                }
            } else {
                return []
            }
        } catch (e) {
            console.log(e)
        }
    }, [defaultContract])


    const disconnectWallet = () => {
        if (onboard) {
            try {
                onboard.walletReset()
            } catch (e) {
                console.error(e)
            }
            setBalance(undefined)
            setAddress(undefined)
            window.localStorage.removeItem('selectedWallet')
        }
    }

    return (
        <Web3Context.Provider
            value={[
                {
                    address,
                    ens,
                    network,
                    balance,
                    wallet,
                    onboard,
                    rule,
                    currentBlock,
                    currentRoundResult,
                    contract: activeContract,
                    defaultContract,
                    totalLiabilities,
                },
                { ready: readyToTransact, disconnect: disconnectWallet },
            ]}
        >
            {children}
        </Web3Context.Provider>
    )
}

export default function useWeb3() {
    return useContext(Web3Context)
}