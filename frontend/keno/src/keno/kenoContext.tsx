import React from 'react';

export interface PreviousResult {
    number: number[],
    info: string[],
}

export interface KenoContextType {
    controller: {
        ready: boolean,
        reset: (previousResult: PreviousResult) => void,
        setGameNumber: (val: string[]) => void,
        reverseSelect: () => boolean,//switch selecting
        setSelectMode: () => boolean,//set to select mode
        setTime: (url: number) => boolean,
        setTimeWithTimestamp: (url: number) => boolean,
        setSelectCallback: (f: (e: SelectEvent) => void) => void,
        getSelected: () => number[],
    },
    selecting: boolean
}

export interface SelectEvent {
    act: string, nu: number, numArray: number[]
}

export const INIT_CONTEXT = {
    controller: {
        ready: false,
        reset: (previousResult: PreviousResult) => { },
        setGameNumber: (val: string[]) => { },
        reverseSelect: () => false,//switch selecting
        setSelectMode: () => false,//set to select mode
        setTime: (url: number) => false,
        setTimeWithTimestamp: (url: number) => false,
        setSelectCallback: (f: (e: SelectEvent) => void) => { },
        getSelected: () => [],
    },
    selecting: false
}

const KenoContext = React.createContext<KenoContextType>(INIT_CONTEXT);

export { KenoContext };