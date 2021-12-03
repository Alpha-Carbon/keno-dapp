import TweenMax from "gsap/TweenMax";
import MainLoop from "mainloop.js"
import * as PIXI from 'pixi.js'
import "pixi-sound"

import { gameConfig } from './config'
import { OBJ_timer } from './countdownTimer'
import { requireSrcs, sound } from './srcLoader'
import { OBJ_keno } from './keno'
import { OBJ_background } from './bg'

export function SetSingleImg(img, x, y, w, h, autoScale) {//input -1 to leave properties unset
    let temp = PIXI.Sprite.fromImage(img);
    if (x != -1) temp.x = x;
    if (y != -1) temp.y = y;
    let width = temp.width;
    let height = temp.height;
    if (w != -1) {
        temp.width = w;
        if (autoScale) temp.height = w * height / width;
    }
    if (h != -1) {
        temp.height = h;
        if (autoScale) temp.width = h * width / height;
    }
    return temp;
}

let pixiIsLoading = true;
let todoWhenLoaded;

let localPath = {
    sound: "../assets/sound",
    img: "../assets/img",
}

export function Load(path) {
    console.log("do load");
    if (process.env.NODE_ENV == "development") {
        requireSrcs(setup, localPath);
    } else {
        requireSrcs(setup, path);
    }
}

export function Init(callback) {
    if (pixiIsLoading) {
        todoWhenLoaded = callback;
    } else {
        callback();
    }
}

function setup() {
    // app.renderer = PIXI.autoDetectRenderer(
    //     gameConfig.GAME_HEIGHT,
    //     gameConfig.GAME_WIDTH,
    //   );
    console.log('loaded');
    pixiIsLoading = false;

    if (todoWhenLoaded) todoWhenLoaded();
}

function gameOBJ(target, selectLimit) {
    // console.log("version:", "2021.11.26.1815")
    let mainContainer = new PIXI.Container();

    let countdownTimer;//object
    let keno;//object
    let background;//object

    background = new OBJ_background(mainContainer);
    keno = new OBJ_keno(mainContainer, selectLimit);
    // countdownTimer = new OBJ_timer(gameConfig.GAME_SCREEN_MIN_UNIT * 4.5/*1.125*/, gameConfig.GAME_SCREEN_MIN_UNIT * 2.5, mainContainer);

    countdownTimer = new OBJ_timer(gameConfig.GAME_SCREEN_MIN_UNIT * 1.3, gameConfig.GAME_SCREEN_MIN_UNIT * 4.2, mainContainer);

    let currentGameState = gameConfig.GAME_STATE.waitForStart;
    let app = new PIXI.Application({
        autoResize: true,
        resolution: devicePixelRatio,
        width: gameConfig.GAME_WIDTH,
        height: gameConfig.GAME_HEIGHT,
        antialias: true,
        backgroundColor: 0x333333
    });
    app.stage.addChild(mainContainer);
    target.appendChild(app.view);

    function initial(previousResult) {
        TweenMax.killAll();
        keno.reset();
        if (previousResult && previousResult.number && previousResult.number.length == gameConfig.EXPECTED_RESULT_AMOUNT)
            keno.setDisplayResult(previousResult.number);

        state_wait();
        if (previousResult.info && previousResult.info.length == 5)
            background.setDisplayResult(previousResult.info);
    }

    this.reset = (previousResult) => {
        initial(previousResult);
    };

    function state_wait() {
        sound.stopAll();
        countdownTimer.setIdle();
        countdownTimer.show();

        finishCallBack();
        currentGameState = gameConfig.GAME_STATE.waitForStart;
    }

    function state_running() {
        if (currentGameState != gameConfig.GAME_STATE.waitForStart) return false;
        // keno.start();
        background.hideDisplayResult();
        keno.hideDisplayResult();
        countdownTimer.displayMessage();
        countdownTimer.show();
        currentGameState = gameConfig.GAME_STATE.running;
        // sound.start.play();
        return true;
    }

    this.stop = (result) => {//from left to right, 0 ~ 2
        if (currentGameState != gameConfig.GAME_STATE.running) return false;
        let resultCallback = () => {
            //console.log('if there\'s anything needs to be done after showing the result');
            // state_wait();
            // console.log("resultCallback");
            initial(result)
        };
        keno.stop(result.number, resultCallback);

        countdownTimer.hide();
        currentGameState = gameConfig.GAME_STATE.showResult;
        return true;
    }

    this.setSelectMode = () => {
        initial([]);
        countdownTimer.setIdle();
        countdownTimer.hide();
        return true;
    };

    this.setTime = (sec) => {
        if (currentGameState != gameConfig.GAME_STATE.waitForStart) {
            return false;
        }
        let secToTimestamp = Date.now() + sec * 1000 + 200;
        countdownTimer.setCountdown(secToTimestamp, state_running);
        countdownTimer.show();
        return true;
    };

    this.setTimeWithTimestamp = (inputTimestamp) => {
        if (currentGameState != gameConfig.GAME_STATE.waitForStart) {
            return false;
        }
        countdownTimer.setCountdown(inputTimestamp, state_running);
        countdownTimer.show();
        return true;
    };

    let finishCallBack;
    this.setFinishCallBack = (callback) => {
        finishCallBack = callback;
    }

    this.setGameNumber = (input) => {
        background.setGameNumber(input);
        // if(!input) input = 'a';
        // input = Number(input);
        // if(Number.isInteger(input)){
        //     background.setGameNumber(input);
        //     return true;
        // } else {
        //     return false;
        // }
    };

    let selecting = false;
    this.reverseSelect = () => {
        // console.log("reverseSelect");
        selecting = !selecting;
        keno.setSelecting(selecting);
        // if (!selecting) {
        //     console.log("number selected", keno.getSelected());
        // }
        return selecting;
    };

    this.getSelected = () => {
        return keno.getSelected()
    }

    this.setSelectCallback = (f) => {
        keno.setSelectCallback(f)
    }

    this.setSelectLimit = (num) => {
        keno.setSelectLimit(num)
    }

    function resize() {
        // let minUnit = ~~(Math.min((window.innerHeight) / gameConfig.SCREEN_SCALE_HEIGHT, (window.innerWidth) / gameConfig.SCREEN_SCALE_WIDTH));
        const parent = app.view.parentNode;
        let minUnit = ~~(Math.min((parent.clientHeight) / gameConfig.SCREEN_SCALE_HEIGHT, (parent.clientWidth) / gameConfig.SCREEN_SCALE_WIDTH));
        // if(minUnit < gameConfig.SCREEN_SCALE_MIN_UNIT) {
        //     app.renderer.resize(gameConfig.SCREEN_MIN_width, gameConfig.SCREEN_MIN_HEIGHT);
        //     mainContainer.scale.set(gameConfig.SCREEN_SCALE_MIN_UNIT/gameConfig.GAME_SCREEN_MIN_UNIT);
        // } else {
        app.renderer.resize(minUnit * gameConfig.SCREEN_SCALE_WIDTH, minUnit * gameConfig.SCREEN_SCALE_HEIGHT);
        mainContainer.scale.set(minUnit / gameConfig.GAME_SCREEN_MIN_UNIT);
        // }
    }

    let parentObserver = new ResizeObserver(resize).observe(target);
    resize();

    function draw() {
        // countdownTimer.draw();
        keno.draw();

        //renderer.render(app.stage);
    }

    function gameLoop() {
    }

    MainLoop.setUpdate(gameLoop).setDraw(draw).start().setMaxAllowedFPS(gameConfig.MAX_FPS);


    let tabChangingCallBack;
    this.setTabChangingCallBack = (input) => {
        tabChangingCallBack = input;
    }
    var timeStopped;
    document.addEventListener('visibilitychange', function () {//stop when tab isn't visable
        if (MainLoop.isRunning()) {
            MainLoop.stop();
            timeStopped = Date.now();

            sound.off();
        }
        else {
            MainLoop.start();
            tabChangingCallBack(Date.now() - timeStopped);
            // console.log("back at "+Date.now());
            if (!background.isMute()) {
                // TweenMax.killDelayedCallsTo(sound.result.play);
                sound.on();
            }
            // console.log(currentGameState);
            if (currentGameState == gameConfig.GAME_STATE.showResult) keno.skipToCurrentTime();
            // //update time
            // if(currentGameState == gameConfig.GAME_STATE.waitForStart){
            //     console.log('UPDATE TIME');//TODO
            //     // this.setTime(sec);
            // }
        }
    });
};

export {
    gameOBJ
}