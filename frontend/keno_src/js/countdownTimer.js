import { gameConfig } from './config'
import { SetSingleImg } from './index'
import { image, sound } from './srcLoader'

function OBJ_timer(centerX, centerY, containerOfAll) {
    let container = new PIXI.Container();
    container.position.set(centerX, centerY);
    containerOfAll.addChild(container);
    let countdownInterval;

    let showAlpha = 0.6;//0.6
    // let testRect = new PIXI.Graphics();
    // testRect.alpha = 0.6;
    // container.addChild(testRect);

    let timerContainer = new PIXI.Container();
    let time = -1;
    let edgeUint = ~~(gameConfig.GAME_SCREEN_MIN_UNIT / 2);
    container.addChild(timerContainer);


    // testRect.beginFill(0xffffff);
    // testRect.drawRect(edgeUint*-10, edgeUint*-2.5, edgeUint * 20, edgeUint * 5);
    // testRect.endFill();

    let message = new PIXI.Text('', { font: 'bold ' + edgeUint * 2.5 + 'px', fill: 'white', align: 'center' });
    message.position.set(-timerContainer.width / 2, -timerContainer.height / 2);
    message.alpha = showAlpha;
    message.anchor.set(0.5)
    container.addChild(message);

    let digits = new Array(gameConfig.TIMER_DIGITS_AMOUNT);
    let posX = 0;
    for (let i = 0; i < gameConfig.TIMER_DIGITS_AMOUNT; i++) {
        let text = new PIXI.Text('', { font: 'bold ' + edgeUint * 3 + 'px', fill: 'white', align: 'center' });

        text.position.set(posX * edgeUint, 0);
        if (i % 3 == 2) posX += 1.1;
        else posX += 1.8;
        // text.alpha = 0.6;
        digits[i] = text;
        timerContainer.addChild(digits[i]);
    }
    timerContainer.alpha = showAlpha;
    timerContainer.position.set(-timerContainer.width / 2, -timerContainer.height / 2);

    // this.setTime = (input) => {
    //     time = input ;
    // }

    let idleText = '-';
    this.displayMessage = () => {
        nextTimestamp = null;
        time = 0;
        clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            time++;
        }, 500);

        drawFunction = showMsg;
        message.alpha = showAlpha;
        timerContainer.alpha = 0;
    }
    this.setIdle = (input) => {
        nextTimestamp = null;
        idleText = (input) ? input : '-';
        // console.log('set idle, text == '+idleText);
        time = -1;
        clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            // console.log('idle...');
            switch (time) {
                case -1:
                    time = -2;
                    break;
                case -2:
                    time = -1;
                    break;
            }
        }, 500);

        drawFunction = showIdle;
        message.alpha = 0;
        timerContainer.alpha = showAlpha;
    }

    let nextTimestamp = null;
    this.setCountdown = (timestamp, todoFunction) => {//set a count down with specific second
        console.log('timer set at ' + timestamp);
        nextTimestamp = timestamp;
        clearInterval(countdownInterval);
        countdownInterval = setInterval((todoFunction) => {
            // time -= 0.5;
            time = (nextTimestamp - Date.now()) / 1000;
            if (time <= 2.8 && time >= 2.4) {
                sound.countDown.play();
            }
            if (time <= 0) {
                clearInterval(countdownInterval);
                //this.setIdle('0');
                this.hide();
                todoFunction();
                nextTimestamp = null;
            }
        }, 500, todoFunction);

        drawFunction = showNumber;
        message.alpha = 0;
        timerContainer.alpha = showAlpha;
    }

    this.removeCountdown = () => {
        clearInterval(countdownInterval);
    }

    let showNumber = () => {
        if (time < 0) return;
        let temp = ~~(time);
        for (let i = gameConfig.TIMER_DIGITS_AMOUNT; i--;) {
            switch (i % 3) {
                case 2:
                    temp = ~~(temp / 60);
                    digits[i].text = (time - ~~(time) > 0.35) ? ':' : '';
                    break;
                case 1:
                    digits[i].text = '' + (temp % 60) % 10;
                    break;
                case 0:
                    digits[i].text = '' + ~~((temp % 60) / 10);
                    break;
            }
        }
    }

    let showIdle = () => {// default: --:--
        if (time == -1) {
            for (let i = 0; i < gameConfig.TIMER_DIGITS_AMOUNT; i++) {
                digits[i].text = idleText;
                if ((i % 3) == 2) digits[i].text = ':';
            }
        } else {
            for (let i = 0; i < gameConfig.TIMER_DIGITS_AMOUNT; i++) {
                digits[i].text = '';
            }
        }
    }

    let showMsg = () => {
        let dotsAmount = time % 4;
        let msg = "开奖中";
        for (let i = 0; i < 3; i++) {
            if (i < dotsAmount) msg += ".";
            else msg += " ";
        }
        message.text = msg;
    }

    let drawFunction = showIdle;
    container.scale.set(0.25);
    this.draw = () => {
        drawFunction();
        // if(time < 0){
        //     showIdle();
        // } else {
        //     showNumber();
        // }
    }

    this.show = () => {
        container.alpha = 1;
    }

    this.hide = () => {
        container.alpha = 0;
    }
}

export {
    OBJ_timer
}