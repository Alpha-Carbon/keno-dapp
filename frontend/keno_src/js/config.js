//parameter settings
function config() {
    this.GAME_STATE = {
        waitForStart: 0,
        running: 1,
        showResult: 2
    };
    //parameter about image, pixel, and coordinates 
    this.MAX_FPS = 60;

    // this.PIC_LOTTERY_BOX = {height: 244, width: 103, base: 75};

    this.PIC_SCROLL = { WIDTH: 60, HEIGHT: 95, TOTALHEIGHT: 950 };
    this.SCROLL_GAP = 40;

    this.SCREEN_SCALE_HEIGHT = 5;
    this.SCREEN_SCALE_WIDTH = 9;
    this.SCREEN_SCALE_MIN_UNIT = 110
    this.SCREEN_MIN_HEIGHT = this.SCREEN_SCALE_HEIGHT * this.SCREEN_SCALE_MIN_UNIT;
    this.SCREEN_MIN_width = this.SCREEN_SCALE_WIDTH * this.SCREEN_SCALE_MIN_UNIT;
    //time parameters
    this.TIME_BALL_FLYING = 1;

    //game parameters
    this.BALL_R = 35;
    this.BALL_AMOUNT = 80;
    this.EXPECTED_RESULT_AMOUNT = 20;
    this.GRID_AMOUNT = 1;
    this.DEFAULT_SOUND = true;
    this.TIMER_DIGITS_AMOUNT = 8;

    this.GAME_HEIGHT = 750;//540;
    this.GAME_WIDTH = 1350;//960;
    this.GAME_SCREEN_MIN_UNIT = 150;//60;

    this.ONE_SECOND = 1000;
    //display
    this.GAME_NAME_TEXT = '大众六合彩';//大众
    this.BALL_LEFT_TEXT = '剩余球数';

    this.BOX_TEXT = ['百', '十', '个'];
    this.CURRENT_GAMENUMBER_TEXT = '本期 ';
    this.GAMENUMBER_UNIT_TEXT = '期';
    this.NEXT_GAMENUMBER_TEXT = '下期 ';//开奖：';

}

let gameConfig = new config();
export { gameConfig }