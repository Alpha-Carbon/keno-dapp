import React, {
    useEffect,
    useContext,
    useState,
    Dispatch,
    SetStateAction,
} from 'react'
import { ethers, providers, BigNumber, utils } from 'ethers'
import { API, Wallet, Ens } from 'bnc-onboard/dist/src/interfaces'

import { getGameRule, DrawResult, GameRule, getResult, getRound, getContractState, blockToRound, RoundInfo, RoundWinners, getWinners } from '../utils/contract'
import { initOnboard } from '../utils/initOnboard'
import Abi from '../abi/KenoAbi.json'
import Config, { AMINO, AMINOX } from '../config'
import { ToastContainer, toast } from 'react-toastify';

interface ContextData {
    address?: string
    ens?: Ens
    network?: number
    balance?: string
    wallet?: Wallet
    onboard?: API
    rule?: GameRule
    currentBlock?: number
    currentRound?: RoundInfo
    currentRoundResult?: DrawResult
    contract?: ethers.Contract
    defaultContract: ethers.Contract
    totalLiabilities?: BigNumber
    winners?: RoundWinners
}

interface ContextActions {
    ready: () => Promise<boolean> // function as property declaration
    disconnect: () => void
    chainInit: boolean
}

type Context = [ContextData, ContextActions]

// let defaultUrl = 'http://localhost:19932'
// let defaultUrl = 'http://localhost:9933'
// let defaultUrl = 'https://leucine0.node.alphacarbon.network'
let defaultUrl = 'https://aminoxtestnet.node.alphacarbon.network'

let defaultProvider: providers.JsonRpcProvider = new providers.JsonRpcProvider(defaultUrl)
let defaultContract = new ethers.Contract(
    // Config(AMINO).contractAddress!,
    Config(AMINOX).contractAddress!,
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
        chainInit: false,
    },
])

function validNetwork(network: number) {
    return network === 31337 || network === 13370
}

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
    const [currentRound, setCurrentRound] = useState<RoundInfo>()
    const [currentRoundResult, setCurrentRoundResult] = useState<DrawResult>()
    const [totalLiabilities, setTotalLiabilities] = useState<BigNumber>()
    const [winners, setWinners] = useState<RoundWinners>()

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
            if (!network || !initFinished || !onboard) return
            if (!validNetwork(network)) {
                toast("Network: " + network + " not supported")
                return
            }

            onboard.config({ networkId: network })
            defaultContract.removeAllListeners()
            defaultProvider.removeAllListeners()
            // defaultProvider = new providers.JsonRpcProvider('http://localhost:19932')
            defaultProvider = new providers.JsonRpcProvider(defaultUrl)
            defaultContract = new ethers.Contract(
                Config(network).contractAddress!,
                Abi,
                defaultProvider
            )

            // Get contract data and setup listeners on default contract
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
        let gameRule = await getGameRule(defaultContract)
        setRule(gameRule)
        let drawRate = gameRule.drawRate.toNumber()
        let blockNumber = await provider.getBlockNumber()
        let initRound = BigNumber.from(blockToRound(blockNumber, drawRate))
        //#TODO should handle no current result exist
        let state = await getContractState(defaultContract, initRound, gameRule.drawRate)
        let initDraw = state.draw

        contract.on('Result', async (round: BigNumber, currentDraw: BigNumber[]) => {
            if (gameRule && (!currentRoundResult || currentRoundResult.round < round)) {
                setCurrentRoundResult({ round, draw: currentDraw })
                await getRound(contract, round.add(1)).then(result => setCurrentRound(result))
                let roundWinners = await getWinners(defaultContract, round, gameRule.drawRate)
                if (roundWinners) {
                    setWinners(roundWinners)
                }
            }
        })
        // contract.on('NewEntry', async (round: BigNumber, player: String) => {
        //     if (provider && currentBlock && blockToRound(currentBlock, drawRate) === round.toNumber() - 1) {
        //         //#TODO use real getter here
        //         //#HACK the getter need to be implemented in contract, it was `getRound`
        //         let result = await getRound(contract, round)
        //         if (result) {
        //             setCurrentRound(result)
        //         }
        //     } else {
        //         console.log('NewEntry, but future round')
        //     }
        // })
        contract.on('EntryWins', async (round: BigNumber, player: String, spots: BigNumber[], hits: boolean[], payout: BigNumber) => {
            console.log('winner', round, player, spots, hits, payout)
            if (player.toLowerCase() === address) {
                let reward = utils.formatEther(payout)
                console.log('you won ' + reward + ' ether')
                toast('You won!')
            }
        })

        if (state)
            setCurrentRound(state.round)
        if (initRound) {
            if (gameRule && initRound.gte(gameRule.startRound)) {
                let roundWinners = await getWinners(defaultContract, initRound, gameRule.drawRate)
                if (roundWinners) {
                    setWinners(roundWinners)
                }
            }
            if (initDraw && initDraw.length !== 0) {
                setCurrentRoundResult({ round: initRound, draw: initDraw })
            }
        }
        if (init) setInitFinished(true)
        // console.log("subscribeContractEvents end")
    }

    async function subscribeBlock(
        provider: providers.JsonRpcProvider,
        contract: ethers.Contract,
    ) {
        let blockNumber = await provider.getBlockNumber()
        let gameRule = await getGameRule(defaultContract)
        if (blockNumber && blockNumber !== -1) {
            setCurrentBlock(blockNumber)
        }
        provider.on('block', async (block) => {
            if (!currentBlock || currentBlock < block) {
                setCurrentBlock(block)
            }
            if (gameRule) {
                const round = blockToRound(block, gameRule.drawRate.toNumber())
                const BRound = BigNumber.from(round)
                if (!currentRoundResult) {
                    let draw = await getResult(contract, BRound, gameRule.drawRate)
                    if (draw.length !== 0)
                        setCurrentRoundResult({ round: BRound, draw: draw })
                }

                await getRound(contract, BRound.add(1)).then(result => setCurrentRound(result))
            }
            setTotalLiabilities(await contract.totalLiabilities())
        })
        setTotalLiabilities(await contract.totalLiabilities())
    }

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
                    currentRound,
                    currentRoundResult,
                    contract: activeContract,
                    defaultContract,
                    totalLiabilities,
                    winners,
                },
                { ready: readyToTransact, disconnect: disconnectWallet, chainInit: initFinished },
            ]}
        >
            {children}
        </Web3Context.Provider>
    )
}

export default function useWeb3() {
    return useContext(Web3Context)
}