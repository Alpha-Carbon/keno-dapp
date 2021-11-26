export interface PreviousResult {
    number: number[],
    info: string[],
}

export interface KenoController {
    ready: boolean,
    reset: (previousResult: PreviousResult) => void,
    stop: (previousResult: PreviousResult) => boolean,
    setGameNumber: (val: string[]) => void,
    reverseSelect: () => boolean,//switch selecting
    setSelectMode: () => boolean,//set to select mode
    setTime: (url: number) => boolean,
    setTimeWithTimestamp: (url: number) => boolean,
    setSelectCallback: (f: (e: SelectEvent) => void) => void,
    getSelected: () => number[],
}

export interface KenoContextType {
    controller: KenoController,
    selecting: boolean,
    container: HTMLDivElement
}

export interface SelectEvent {
    act: string, nu: number, numArray: number[]
}

export const createInitContext = (container: any) => {
    return {
        controller: {
            ready: false,
            reset: (previousResult: PreviousResult) => { },
            stop: (previousResult: PreviousResult) => false,
            setGameNumber: (val: string[]) => { },
            reverseSelect: () => false,//switch selecting
            setSelectMode: () => false,//set to select mode
            setTime: (url: number) => false,
            setTimeWithTimestamp: (url: number) => false,
            setSelectCallback: (f: (e: SelectEvent) => void) => { },
            getSelected: () => [],
        },
        selecting: false,
        container
    }
}
