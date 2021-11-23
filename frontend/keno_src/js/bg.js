import { gameConfig } from './config'
import { SetSingleImg } from './index'
import { image, sound } from './srcLoader'

function OBJ_background(containerOfAll) {
    this.time = 0;//make it a property so that tween can control it
    let bgImg = SetSingleImg(image.bg.img, 0, 0, gameConfig.GAME_WIDTH, gameConfig.GAME_HEIGHT, false);//backgroung can be muli-layered
    containerOfAll.addChild(bgImg);

    let info = new PIXI.Container();
    containerOfAll.addChild(info);

    let muteButton = {};
    muteButton.isMute = !gameConfig.DEFAULT_SOUND;
    muteButton.soundOn = PIXI.Texture.from(image.bg.sound.on);
    muteButton.soundOff = PIXI.Texture.from(image.bg.sound.off);

    muteButton.button = (muteButton.isMute) ? new PIXI.Sprite(muteButton.soundOff) : new PIXI.Sprite(muteButton.soundOn);
    muteButton.button.anchor.set(0.5);
    muteButton.button.position.set(50, 710);
    muteButton.button.scale.set(50 / muteButton.soundOn.height);
    muteButton.button.interactive = true;
    muteButton.button.buttonMode = true;
    muteButton.button.on('mouseup', onButtonUp)
        .on('touchend', onButtonUp)
        .on('mouseupoutside', onButtonUp)
        .on('touchendoutside', onButtonUp);

    function onButtonUp() {
        muteButton.isMute = !muteButton.isMute;
        if (muteButton.isMute) {
            this.texture = muteButton.soundOff;
            sound.off();
        } else {
            this.texture = muteButton.soundOn;
            sound.on();
        }
    }
    this.isMute = () => {
        return muteButton.isMute;
    }
    containerOfAll.addChild(muteButton.button);
    ///display parameters
    let xStart = gameConfig.GAME_SCREEN_MIN_UNIT * 0.72;
    let yStart = gameConfig.GAME_SCREEN_MIN_UNIT * 2.35;//2.2
    let textStyle = { fontSize: 27, fill: "white", align: 'left' };

    let currentGameNumber = {};
    currentGameNumber.val = 123;
    currentGameNumber.string = new PIXI.Text(gameConfig.CURRENT_GAMENUMBER_TEXT + currentGameNumber.val, textStyle);
    currentGameNumber.string.anchor.set(0, 0.5);
    currentGameNumber.string.position.set(xStart, yStart);
    info.addChild(currentGameNumber.string);

    let nextGameStartTime = {};
    nextGameStartTime.val = '10:00:00';
    nextGameStartTime.string = new PIXI.Text(gameConfig.NEXT_GAMENUMBER_TEXT + nextGameStartTime.val, textStyle);
    nextGameStartTime.string.anchor.set(0, 0.5);
    nextGameStartTime.string.position.set(xStart, yStart + 45);
    info.addChild(nextGameStartTime.string);

    let coordinates = { x: [gameConfig.GAME_SCREEN_MIN_UNIT * 0.55, gameConfig.GAME_SCREEN_MIN_UNIT * 1.2], y: [462, 502, 542] };
    let resultArea = new Array(6);
    for (let i = 0; i < 6; i++) {
        resultArea[i] = new PIXI.Text("", { fontSize: 27, fill: "white", align: 'left' });
        resultArea[i].anchor.set(0, 0.5);
        resultArea[i].position.set(coordinates.x[~~(i / 3)], coordinates.y[i % 3]);
        info.addChild(resultArea[i]);
    }
    resultArea[6] = new PIXI.Text("", { fontSize: 27, fill: "white", align: 'left' });
    resultArea[6].anchor.set(0, 0.5);
    resultArea[6].position.set(gameConfig.GAME_SCREEN_MIN_UNIT * 1.75, coordinates.y[0]);
    info.addChild(resultArea[6]);
    resultArea[7] = new PIXI.Text("", { fontSize: 27, fill: "white", align: 'left' });
    resultArea[7].anchor.set(0, 0.5);
    resultArea[7].position.set(gameConfig.GAME_SCREEN_MIN_UNIT * 2.05, coordinates.y[0]);
    info.addChild(resultArea[7]);

    // resultArea[0].text = "总和";
    // resultArea[1].text = "前后和";
    // resultArea[2].text = "单双和";
    resultArea[0].text = "";
    resultArea[1].text = "";
    resultArea[2].text = "";
    function clearResultArea() {
        for (let i = 3; i < 7; i++) {
            resultArea[i].text = '';
        }
    }
    // let gameName = {};
    // gameName = new PIXI.Text(gameConfig.GAME_NAME_TEXT, {fontSize: 50, fill: 0xffffff, align: 'left'});
    // gameName.anchor.set(0, 0.5);
    // gameName.position.set(35, 50);
    // info.addChild(gameName);

    this.hideDisplayResult = () => {
        // for(let i = 0; i < gameConfig.EXPECTED_RESULT_AMOUNT; i ++){
        //     displayResult.containers[i].alpha = 0;
        // }
    }

    this.setDisplayResult = (input) => {
        resultArea[3].text = input[0];
        resultArea[6].text = input[1];
        resultArea[7].text = input[2];
        resultArea[4].text = input[3];
        resultArea[5].text = input[4];
    }

    this.setGameNumber = (text) => {
        console.log(text)
        if (text[0]) {
            currentGameNumber.val = text[0];
            currentGameNumber.string.text = gameConfig.CURRENT_GAMENUMBER_TEXT + text[0];
        }
        if (text[1]) {
            nextGameStartTime.val = text[1];
            nextGameStartTime.string.text = gameConfig.NEXT_GAMENUMBER_TEXT + text[1];
        }
    }
}

export { OBJ_background }