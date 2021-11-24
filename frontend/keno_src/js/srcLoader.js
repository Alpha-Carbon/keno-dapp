import { gameConfig } from './config'

//image required
var image = {};
image.bg = { img: null, sound: { on: null, off: null } };
image.displayBall = { R: null, G: null, B: null };
image.ball = { default: null, selected: null, bigFlying: null };

//sound required
var sound = {};

// sound.off();

function requireSrcs(callback, path) {
    sound.countDown = PIXI.sound.Sound.from((path.sound + '/countdown.mp3'));// ('/countdown.mp3');
    sound.result = PIXI.sound.Sound.from((path.sound + '/result.mp3'));// ('/over.mp3');
    sound.start = PIXI.sound.Sound.from((path.sound + '/soundeffect_drum.m4a'));// ('/car.mp3');
    sound.start.loop = true;
    sound.stop = PIXI.sound.Sound.from((path.sound + '/gearStop.mp3'));// ('/car.mp3');
    sound.isMute = !gameConfig.DEFAULT_SOUND;
    sound.pauseAll = () => {
        sound.countDown.pause();
        sound.result.pause();
        sound.start.pause();
        sound.stop.pause();
    }

    sound.stopAll = () => {
        sound.countDown.stop();
        sound.result.stop();
        sound.start.stop();
        sound.stop.stop();
    }
    sound.on = () => {
        sound.isMute = false;
        sound.countDown.volume = 1;
        sound.result.volume = 1;
        sound.start.volume = 1;
        sound.stop.volume = 1;
    }
    sound.off = () => {
        sound.isMute = true;
        sound.countDown.volume = 0;
        sound.result.volume = 0;
        sound.start.volume = 0;
        sound.stop.volume = 0;
    }

    image.star = (path.img + '/star.png');
    image.ball.default = (path.img + '/ballDefault.png');
    image.ball.selected = (path.img + '/ballSelected.png');
    image.ball.bigFlying = (path.img + '/ballFlying.png');
    image.bg.img = (path.img + '/bg.png');
    image.bg.sound.on = (path.img + '/mute0.png');
    image.bg.sound.off = (path.img + '/mute1.png');

    for (let i = 0; i < gameConfig.BALL_AMOUNT; i++) {
        let num = i + 1;
        image.ball[i] = (path.img + '/' + num + '.png');
    }

    PIXI.loader//loader can load by array or by variable

        .add(image.star)
        .add(image.ball.default)
        .add(image.ball.selected)
        .add(image.ball.bigFlying)
        .add(image.bg.img)
        .add(image.bg.sound.on)
        .add(image.bg.sound.off)
        .load(callback);
}

export { image, sound, requireSrcs }