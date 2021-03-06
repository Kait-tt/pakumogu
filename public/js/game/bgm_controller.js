class BGMController {
    constructor (game) {
        this.bgm = null;
        this.game = game;
    }

    play (bgm) {
        this.stop();
        this.bgm = this.game.assets[bgm];
        if (this.bgm) {
            this.bgm.play();
            this.startLoop();
        }
    }

    stop () {
        if (this.bgm) {
            this.bgm.stop();
        }
        this.stopLoop();
    }

    startLoop () {
        if (this.bgm && this.bgm._element) {
            this.bgm._element.loop = true;
        }
        if (this.bgm && this.bgm.src) {
            this.bgm.src.loop = true;
        }
    }

    stopLoop () {
        if (this.bgm && this.bgm._element) {
            this.bgm._element.loop = false;
        }
        if (this.bgm && this.bgm.src) {
            this.bgm.src.loop = false;
        }
    }
}
