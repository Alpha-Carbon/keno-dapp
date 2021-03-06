export const MAINNET = 1
export const ROPSTEN = 3
export const KOVAN = 42
export const RINKEBY = 4
export const AMINO = 31337
export const AMINOX = 13370
export const GETH_DEV = 1337
export const supportedChains = [
    MAINNET,
    // ROPSTEN,
    // KOVAN,
    RINKEBY,
    AMINO,
    AMINOX,
    GETH_DEV,
]

type Config = {
    contractAddress?: string
}

//#TODO change these
const config = {
    mainnet: {
        contractAddress: '0x98afe7a8d28bbc88dcf41f8e06d97c74958a47dc',
    },
    ropsten: {
        contractAddress: undefined,
    },
    kovan: {
        contractAddress: undefined,
    },
    rinkeby: {
        contractAddress: '0xC628eCbAf90Ab0062516ca556c0DE9b382a67BbD',
    },
    amino: {
        contractAddress: '0x527394f2670D8c312760B262F6C9Ea08AF1A56d6',
        // contractAddress: '0x53b96c552Ac100Ca97a2723255470E8549D2401b', //obsolete
        // contractAddress: '0xc01Ee7f10EA4aF4673cFff62710E1D7792aBa8f3',
    },
    aminox: {
        contractAddress: '0xAb2Ef5684Cf32E61901A9dceF36b1cf0Ae80f631',
    },
    gethDev: {
        contractAddress: '0x5640545abF63e10e09d1a8dCC5A3caE951872295',
    },
}

export default function Configure(chainId: number): Config {
    switch (chainId) {
        case MAINNET:
            return config.mainnet
        case ROPSTEN:
            return config.ropsten
        case KOVAN:
            return config.kovan
        case RINKEBY:
            return config.rinkeby
        case AMINO:
            return config.amino
        case AMINOX:
            return config.aminox
        case GETH_DEV:
            return config.gethDev
        default:
            return config.mainnet
    }
}