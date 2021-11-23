import { gameConfig } from './config'
import { SetSingleImg } from './index'
import { image, sound } from './srcLoader'

function OBJ_keno(containerOfAll, selectLimit) {
    let ballArray = new Array(gameConfig.BALL_AMOUNT);
    let animationFunc = [];
    let ballLeftText = {};
    ballLeftText.title = new PIXI.Text(gameConfig.BALL_LEFT_TEXT, { fontSize: 20, fill: "white", align: 'center' });
    ballLeftText.title.anchor.set(0.5);
    ballLeftText.title.position.set(0, 0);
    // ballLeftText.container.alpha = 0;
    ballLeftText.num = 20;
    ballLeftText.numText = new PIXI.Text('' + ballLeftText.num, { fontSize: 20, fill: "white", align: 'center' });
    ballLeftText.numText.anchor.set(0.5);
    ballLeftText.numText.position.set(0, 30);
    ballLeftText.container = new PIXI.Container();
    ballLeftText.container.addChild(ballLeftText.title);
    ballLeftText.container.addChild(ballLeftText.numText);
    containerOfAll.addChild(ballLeftText.container);
    ballLeftText.container.position.set(200, 650);

    let arrayLimit = selectLimit || 5;
    let numArray = [];
    let selectMode = false;
    let selectCallback = () => { };
    this.setSelecting = (selecting) => {
        if (selecting) {
            // console.log("numArray erased");
            numArray = [];
        }
        selectMode = selecting;
    }
    this.setSelectCallback = (f) => {
        selectCallback = f;
        // console.log("selectCallback", selectCallback)
    };
    this.setSelectLimit = (num) => {
        arrayLimit = num;
    };

    this.getSelected = () => {
        return numArray;
    }
    function addNum(num) {
        if (selectMode) {
            let index = numArray.indexOf(num);
            if (index !== -1) {
                numArray.splice(index, 1)
                selectCallback({ act: "delete", num, numArray })
                return false;
            } else {
                if (numArray.length < arrayLimit) {
                    numArray.push(num);
                    selectCallback({ act: "add", num, numArray })
                    return true;
                }
            }
        }
        //  else {
        //     console.log("not selecting, ignoring", num);
        // }
        return false;
    }


    function OBJ_ball(x, y, num) {
        let container = new PIXI.Container();
        let ball = {
            default: SetSingleImg(image.ball.default, 0, 0, gameConfig.BALL_R * 2, -1, true),
            selected: SetSingleImg(image.ball.selected, 0, 0, gameConfig.BALL_R * 2, -1, true),
        };
        ball.default.anchor.set(0.5);
        ball.selected.anchor.set(0.5);
        ball.default
            .on('mousedown', () => {
                if (addNum(num)) {
                    this.ballSelected()
                } else {
                    this.reset()
                }
            });
        ball.default.interactive = true;
        let numText = new PIXI.Text('' + num, { fontSize: gameConfig.BALL_R, fill: "white", align: 'center' });
        numText.anchor.set(0.5);
        numText.position.set(0, 0);

        let star = {
            big: SetSingleImg(image.star, 0, 0, gameConfig.BALL_R * 4, -1, true),
            small: [
                SetSingleImg(image.star, 0, 0, gameConfig.BALL_R, -1, true),
                SetSingleImg(image.star, 0, 0, gameConfig.BALL_R, -1, true),
                SetSingleImg(image.star, 0, 0, gameConfig.BALL_R, -1, true),
            ]
        }

        star.big.anchor.set(0.5);
        star.small[0].anchor.set(0.5);
        star.small[1].anchor.set(0.5);
        star.small[2].anchor.set(0.5);

        container.addChild(ball.default);
        container.addChild(ball.selected);
        container.addChild(star.small[0]);
        container.addChild(star.small[1]);
        container.addChild(star.small[2]);
        container.addChild(star.big);
        container.addChild(numText);

        container.position.set(x, y);
        containerOfAll.addChild(container);
        this.reset = () => {
            numText.style.fill = "white";
            numText.scale.set(1);
            ball.default.alpha = 1;
            ball.selected.alpha = 0;
            star.big.alpha = 0;
            star.small[0].alpha = 0;
            star.small[1].alpha = 0;
            star.small[2].alpha = 0;
        };
        this.textScaleSet = (scale) => {
            numText.scale.set(scale)
        }

        let expectedSoundPlayedTime = 0;
        this.playSound = () => {
            // console.log(Date.now()+" "+expectedSoundPlayedTime);
            if (expectedSoundPlayedTime && Date.now() <= expectedSoundPlayedTime) {
                sound.result.play();
            }
        };

        this.select = (timeline, currentStartTime, TLStartTime) => {
            // sound.result.play();
            // this.ballSelected();

            // TweenMax.fromTo(animationFunc[id], 0.5, {s: 1.5}, {s: 1, lazy: true, ease: Power2.easeIn});

            let id = animationFunc.length;
            expectedSoundPlayedTime = TLStartTime + 1000 * (currentStartTime) + 300;
            animationFunc[id] = { s: 1, function: this.textScaleSet }
            timeline.set(animationFunc[id], { s: 1.5 }, currentStartTime)
                .to(animationFunc[id], 0.5, { s: 1, lazy: true, ease: Power2.easeIn }, currentStartTime)
                .call(() => {
                    // animationFunc[id].s = 1.5;
                    this.playSound();
                    this.ballSelected();
                }, [], this, currentStartTime);
            return currentStartTime + 0.5;
        }
        this.ballSelected = () => {
            ball.default.alpha = 0;
            ball.selected.alpha = 1;
            numText.style.fill = "#6930C3";
        };
        this.getPosition = () => {
            return { x: x, y: y };
        };
        this.createStars = (timeline, startTime) => {
            timeline.set(star.big, { alpha: 1, rotation: 0 }, startTime)
                .set(star.small[0], { x: 0, y: 0, alpha: 1, rotation: 0 }, startTime)
                .set(star.small[1], { x: 0, y: 0, alpha: 1, rotation: 0 }, startTime)
                .set(star.small[2], { x: 0, y: 0, alpha: 1, rotation: 0 }, startTime);

            timeline.to(star.big, 3, { alpha: 0, rotation: 1.5, lazy: true, ease: Power3.easeOut }, startTime)
                .to(star.small[0], 2, { alpha: 0, x: 75, y: 40, rotation: 1.5, lazy: true, ease: Power3.easeOut }, startTime)
                .to(star.small[1], 2, { alpha: 0, x: 60, y: -30, rotation: 1.5, lazy: true, ease: Power3.easeOut }, startTime)
                .to(star.small[2], 2, { alpha: 0, x: -70, y: +10, rotation: 1.5, lazy: true, ease: Power3.easeOut }, startTime);
            return startTime + 3;
        };
    }
    let firstBallPosition = { x: gameConfig.GAME_SCREEN_MIN_UNIT * 2.8 + gameConfig.BALL_R + 12, y: gameConfig.BALL_R * 1.2 + 12 }
    let gap = 20;
    let oneRow = 10;

    for (let i = 0; i < gameConfig.BALL_AMOUNT; i++) {
        ballArray[i] = new OBJ_ball(firstBallPosition.x + i % oneRow * (gameConfig.BALL_R * 2 + gap), firstBallPosition.y + ~~(i / oneRow) * (gameConfig.BALL_R * 2 + gap), i + 1);
    }

    let flyingBall = SetSingleImg(image.ball.bigFlying, 0, 0, -1, -1, true);
    flyingBall.anchor.set(0.45, 0.42);
    // flyingBall.position.set(gameConfig.GAME_SCREEN_MIN_UNIT*4.5, gameConfig.GAME_SCREEN_MIN_UNIT);
    flyingBall.position.set(firstBallPosition.x, firstBallPosition.y);
    flyingBall.scale.set(0.08);
    let drawScale = { value: 0.08 };
    containerOfAll.addChild(flyingBall);

    function selectBall(id, timeline, TLStartTime) {//ver Timeline
        // return;
        // flyingBall.alpha = 1;
        let end = ballArray[id].getPosition();
        let start = { x: gameConfig.GAME_SCREEN_MIN_UNIT * 6, y: gameConfig.GAME_SCREEN_MIN_UNIT * 6.5 };
        flyingBall.position.set(start.x, start.y);
        // let completeFunction = () => {
        //     ballArray[id].select();
        //     ballArray[id].createStars();
        //     minusOne();
        // }
        timeline.set(flyingBall, { alpha: 1 }, 0)
            .fromTo(flyingBall, gameConfig.TIME_BALL_FLYING, { x: start.x, y: start.y }, { x: end.x, y: end.y, lazy: true, ease: Power2.easeInOut }, 0)
            .fromTo(drawScale, gameConfig.TIME_BALL_FLYING, { value: 0.32 }, { value: 0.08, lazy: true, ease: Power2.easeIn }, 0)
            .set(flyingBall, { alpha: 0 }, gameConfig.TIME_BALL_FLYING);
        return Math.max(ballArray[id].select(timeline, gameConfig.TIME_BALL_FLYING, TLStartTime), ballArray[id].createStars(timeline, gameConfig.TIME_BALL_FLYING));

    }

    let ballLeftNum = {};
    ballLeftNum.val = -1;
    // function minusOne(){
    //     ballLeftNum.val--;
    // }

    function animationList(startTime) {
        let duration;
        // this.list = [];
        this.mainTimeLine = new TimelineMax();

        this.addAnim = (newTL, addTime) => {
            this.mainTimeLine.add(newTL, addTime);
        };
        this.addCall = (func, time) => {
            this.mainTimeLine.call(func, [], this, time);
        };
        this.play = () => {
            this.mainTimeLine.play;
        };
        this.setDuration = (time) => {
            duration = time;
        }
        this.setProgress = () => {
            let progress = (Date.now() - startTime) / 1000 / duration;
            // console.log(progress);
            if (progress > 1) progress = 1;
            this.mainTimeLine.progress(progress);
        };
    }

    let animation;
    let between = gameConfig.TIME_BALL_FLYING + 0.2;
    this.stop = (result, backToStateWaitFunction) => {
        let TLStartTime = Date.now();
        animation = new animationList(TLStartTime);
        ballLeftText.container.alpha = 1;
        ballLeftNum.val = result.length;
        // setBallLeft(result.length);
        // return;
        // console.log("get", result);
        //create N tween
        let len = result.length;
        let delay = 0;
        for (let i = 0; i < len; i++) {
            let tempTL = new TimelineMax();

            selectBall(result[i], tempTL, TLStartTime + delay * 1000);
            tempTL.set(ballLeftNum, { val: 19 - i }, gameConfig.TIME_BALL_FLYING);
            // let completeFunction = ()=>{
            //     selectBall(result[i]);
            // }
            // TweenMax.to(dummy, 0, {delay: delay, onComplete: completeFunction});
            animation.addAnim(tempTL, delay);
            delay += between;
        }

        let completeFunction = () => {
            backToStateWaitFunction();
            animationFunc = [];
            ballLeftText.container.alpha = 0;
        }
        animation.addCall(completeFunction, between * len + 3);
        animation.setDuration(between * len + 3);
        animation.play();
    }

    this.skipToCurrentTime = () => {
        if (!animation) return;
        animation.setProgress()
        // if(startTime == -1) return;
        // let progressTime = (Date.now()-startTime)/1000;
        // console.log(progressTime)
        // animationTL.time(progressTime);
    }

    this.reset = () => {
        // ballLeftText.container.alpha = 0;
        // startTime = -1;
        ballLeftText.container.alpha = 0;
        let len = ballArray.length;
        for (let i = 0; i < len; i++) {
            ballArray[i].reset();
        }

        flyingBall.alpha = 0;
        animationFunc = [];

    }
    this.hideDisplayResult = () => {
        for (let i = 0; i < ballArray.length; i++) {
            ballArray[i].reset();
        }
    }
    this.setDisplayResult = (result) => {
        // console.log("set previousResult");
        if (result && result.length == gameConfig.EXPECTED_RESULT_AMOUNT) {
            for (let i = 0; i < gameConfig.EXPECTED_RESULT_AMOUNT; i++) {
                ballArray[result[i]].ballSelected();
            }
        }
    }

    this.draw = () => {
        flyingBall.scale.set(drawScale.value);
        for (let i = 0; i < animationFunc.length; i++) {
            animationFunc[i].function(animationFunc[i].s);
        }

        if (ballLeftNum.val > -1) ballLeftText.numText.text = '' + ballLeftNum.val;
    }
};

export {
    OBJ_keno
}