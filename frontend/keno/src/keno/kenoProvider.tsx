import React, { useEffect, useState } from 'react'
import { KenoContext, INIT_CONTEXT, SelectEvent, PreviousResult } from './kenoContext'
import useWeb3 from '../hooks/useWeb3'
import { BigNumber } from '@ethersproject/bignumber';

interface KenoProviderProps {
    children?: React.ReactNode;
}

interface KenoGame { setSelectLimit: (arg0: BigNumber) => void; setTabChangingCallBack: (arg0: (time: number) => void) => void; setFinishCallBack: (arg0: () => void) => void; setGameNumber: (arg0: string[]) => void; reset: (arg0: PreviousResult) => void; setSelectCallback: (arg0: (e: SelectEvent) => void) => void; reverseSelect: any; setSelectMode: any; setTime: any; setTimeWithTimestamp: any; getSelected: any; };

const KenoProvider = ({ children }: KenoProviderProps): React.ReactElement<KenoProviderProps> => {
    let container = document.getElementById("kenoContainer");
    let game: KenoGame;
    const [controller, setController] = useState(INIT_CONTEXT.controller);
    const [selecting, setSelecting] = useState(INIT_CONTEXT.selecting);
    const [{ rule }] = useWeb3()

    useEffect(() => { if (rule && game) game.setSelectLimit(rule.spots) }, [rule])

    //#TODO get initstate befor first render
    function initKeno() {
        console.log("initKeno")
        // if (!number) return
        let previousResult = {
            number: [],
            info: ['', '', '', '', '']
        };
        // require src/keno/bundle.js exist, or there'll be errors
        window.keno.Load({
            sound: "./keno/assets/sound",
            img: "./keno/assets/img",
        })
        window.keno.Init(() => {
            game = new window.keno.gameOBJ(container, rule?.spots);//input body to append the game
            //get data from server here

            game.setTabChangingCallBack((time: number) => { console.log("time since tab unseen " + time) });
            game.setFinishCallBack(() => {
                // console.log("test callback when finish");
            })
            // let simLastResult = mockResult();
            // console.log('simulate result', simLastResult);


            // game.setGameNumber(['3141592', 'TE:ST:ING']); // will change game number // can be called any time
            game.setGameNumber(['  ', '  ', '  ']);
            // game.reset({
            //     number: simLastResult,
            //     // info: ['1410', '大', '单', '前(多)', '双(多)']
            //     info: ['', '', '', '', '']
            // });                  //We'll need previous game result and reset with it
            game.reset(previousResult);
            // game.setTime(testCountdown);                //We'll need a countdown time to set timer

            game.setSelectCallback((e: SelectEvent) => {
                console.log("callback", e);
            });

            let selecting = false;
            function reverseSelect() {
                selecting = game.reverseSelect()
                setSelecting(selecting)
                return selecting
            }

            setController({
                ready: true,
                reset: game.reset,
                setGameNumber: game.setGameNumber,
                reverseSelect,
                setSelectMode: game.setSelectMode,
                setTime: game.setTime,
                setTimeWithTimestamp: game.setTimeWithTimestamp,
                setSelectCallback: game.setSelectCallback,
                getSelected: game.getSelected,
            })
        });
    }

    // function mockResult() {
    //     return [2, 3, 10, 20, 24, 25, 26, 31, 32, 33, 35, 37, 53, 55, 57, 58, 64, 65, 66, 78];
    // }


    useEffect(() => {
        initKeno()
    }, []);

    return (
        <KenoContext.Provider value={{ controller, selecting }}>
            {children}
        </KenoContext.Provider >
    );
};

export default KenoProvider;