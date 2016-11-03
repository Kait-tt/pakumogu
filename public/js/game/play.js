class PlayPage {
    constructor (game, serverGame) {
        this.game = game;

        this.normalItems = serverGame.normalItems;
        this.powerItems = serverGame.powerItems;
        this.players = serverGame.players;
        this.timeLimit = serverGame.timeLimit;

        this.isInvincible = false;
        this.isEnded = false;
        this.isTimeLimit = false;
        this.wolfImageIndex = 0;
        this.mySpeed = 0;

        this.bgm = this.getMapBgm(serverGame.map);

        this.scene = new Scene();

        // background image
        this.bg = new Sprite(1920, 1080);
        this.bg.image = this.game.assets[gameImg];
        this.scene.addChild(this.bg);

        // map
        this.mapHeight = serverGame.map.height;
        this.mapWidth = serverGame.map.width;
        this.map = initDynamicMap(this.game, serverGame.map);
        this.scene.addChild(this.map);

        // init all normal item
        this.normalItemSprites = {};
        this.normalItems.forEach(item => {
            const itemSprite = initNormalItem(this.game, item);
            this.normalItemSprites[item.id] = itemSprite;
            this.scene.addChild(itemSprite);
        });

        // init all power items
        this.powerItemSprites = {};
        this.powerItems.forEach(item => {
            // init item obj and assign to list for checking when sheep hit
            const itemSprite = initPowerItem(this.game, item);
            this.powerItemSprites[item.id] = itemSprite;
            this.scene.addChild(itemSprite);
        });

        // init all character
        this.playerSprites = {};
        this.players.forEach(player => {
            const playerSprite = this.initPlayer(player);
            this.playerSprites[player.id] = playerSprite;

            if (myId === player.id) {
                //set speed every move
                this.mySpeed = player.isEnemy ? WOLF_SPEED : SHEEP_SPEED;
            }

            this.scene.addChild(playerSprite);
        });

        this.myPlayer = this.players.find(x => x.id === myId);
        this.mySprite = this.playerSprites[myId];

        // set move event
        this.mySprite.on(Event.ENTER_FRAME, () => this.onMyPlayerEnterFrame());

        // set sheep and wolfs
        this.sheep = this.players.find(x => !x.isEnemy);
        this.wolfs = this.players.filter(x => x.isEnemy);

        // left side
        const leftXMargin = 60;
        let leftYItemMargin = 656;

        // score on left side
        this.scoreLabel = new Label();
        this.scoreLabel.font = `36px ${normalFont}`;
        this.scoreLabel.moveTo(leftXMargin, 350);
        this.scene.addChild(this.scoreLabel);

        // item status on left side
        const itemPointMax = [this.normalItems.length, 3, 1, 1];
        const itemTypes = ['normal', 'invincible', 'bomb', 'slow'];
        this.sideItemLabels = [];
        itemTypes.forEach((type, i) => {
            const [x, y] = [leftXMargin, leftYItemMargin + 70 * i];
            let itemSprite;
            if (i) {
                itemSprite = initPowerItem(this.game, {coordinate: {x, y}}, type);
            } else {
                itemSprite = initNormalItem(this.game, {coordinate: {x, y}});
            }

            this.scene.addChild(itemSprite);

            const itemLabel = new Label();
            itemLabel.font = `36px ${normalFont}`;
            itemLabel.moveTo(x + 100, y);
            itemLabel.updateText = function (value) {
                this.text = `${itemTypes[i]} : ${value}/${itemPointMax[i]}`;
            };

            this.sideItemLabels.push(itemLabel);
            this.scene.addChild(itemLabel);
        });

        this.updateScores(serverGame);

        // init right side
        // set right side screen position
        const fixPositionRightSide = [[1515, 90], [1515, 275], [1515, 455], [1515, 640], [1515, 825]];

        this.profileSprites = {};
        this.deathFrames = {};
        this.blackBoxes = {};
        this.players.forEach((player, i) => {
            const profile = new Sprite(pixel, pixel);
            profile.image = this.game.assets[charImg];
            profile.frame = player.imageIndex * 3;

            this.deathFrames[player.id] = player.imageIndex * 3 + 2;

            profile.scale(3);
            profile.x = fixPositionRightSide[i][0] + 52;
            profile.y = fixPositionRightSide[i][1] + 25;

            this.profileSprites[player.id] = profile;
            this.scene.addChild(profile);

            const playerName = player.user ? player.user.username : 'AI';

            const profileTagLabel = new Label(`[${playerName}]`);
            profileTagLabel.font = `36px ${normalFont}`;
            profileTagLabel.moveTo(fixPositionRightSide[i][0] + 50 ,fixPositionRightSide[i][1] + 120);
            this.scene.addChild(profileTagLabel);
        });

        // time label
        this.timeLabel = new Label();
        this.timeLabel.font = `36px ${normalFont}`;
        this.timeLabel.moveTo(leftXMargin, 530);
        this.updateTimeLabel();
        this.scene.addChild(this.timeLabel);

        // ready sprite
        this.stateSprite = new Sprite(480, 272);
        this.stateSprite.moveTo(1920 / 2 - 220, 1080 / 2 - 150);

        // bomb effect sprite
        this.bombEffect = new Sprite(480, 272);
        this.bombEffect.moveTo(1920 / 2 - 220, 1080 / 2 - 150);
        this.bombEffect.image = this.game.assets[bombImg];

        // set socket events
        socket.on('movePlayer', req => this.onMovePlayer(req));
        socket.on('killSheep', req => this.onKillSheep(req));
        socket.on('killWolf', req => this.onKillWolf(req));
        socket.on('respawnWolf', req => this.onRespawnWolf(req));
        socket.on('takeNormalItem', req => this.onTakeNormalItem(req));
        socket.on('takePowerItem', req => this.onTakePowerItem(req));
        socket.on('startInvincible', () => this.onStartInvincible());
        socket.on('endInvincible', () => this.onEndInvincible());
        socket.on('bomb', () => this.onBomb());
        socket.on('startSlow', () => this.onStartSlow());
        socket.on('endSlow', () => this.onEndSlow());
        socket.on('endGame', (req) => this.onEndGame(req));
        socket.on('updateScore', (scores) => this.onUpdateScore);
    }

    init () {
        // stop the music
        bgmController.stop();

        this.ready();
        this.game.replaceScene(this.scene);
    }

    initPlayer (player) {
        const sprite = new Sprite(pixel, pixel);
        sprite.image = this.game.assets[charImg];

        //count for change frame
        player.moveFrameCount = 0;

        //starting point
        sprite.x = player.coordinate.x;
        sprite.y = player.coordinate.y;

        // if enemy = wolf
        if (player.isEnemy){
            // wolf
            player.imageIndex = this.wolfImageIndex % 4 + 1;
            ++this.wolfImageIndex;
        } else {
            // sheep
            player.imageIndex = 0;
        }

        sprite.frame = player.imageIndex * 3;

        return sprite;
    }

    ready () {
        this.game.assets[readySe].play();

        this.stateSprite.image = this.game.assets[readyImg];
        this.scene.addChild(this.stateSprite);
        setTimeout(() => {
            this.game.assets[startSe].play();
            this.stateSprite.image = this.game.assets[startImg];

            setTimeout(() => {
                this.scene.removeChild(this.stateSprite);
                socket.startGame();

                bgmController.play(this.bgm);

                // count game time after start game
                this.startTimeLabelUpdate();
            }, 500);
        }, 2000);
    }

    updateScores (scores) {
        const scoreText = ('00000' + scores.score).slice(-5);
        this.scoreLabel.text = `score : ${scoreText}`;

        ['takeNormalItemCount', 'takeInvincibleItemCount', 'takeBombItemCount', 'takeSlowItemCount'].forEach((key, i) => {
            this.sideItemLabels[i].updateText(scores[key]);
        });
    }

    startTimeLabelUpdate () {
        const timeIntervalId = setInterval(() => {
            if (this.isEnded) {
                clearInterval(timeIntervalId);
            }

            if (this.isTimeLimit) {
                this.timeLimit = 0;
            } else if (!this.isEnded) {
                this.timeLimit = Math.max(0, this.timeLimit - 1000);
            }

            this.updateTimeLabel();
        }, 1000);
    }

    updateTimeLabel () {
        const timeText = this.timeLimit / 1000;
        this.timeLabel.text = `time : ${timeText}`;
    }

    onMovePlayer (req) {
        this.game.assets[footStepsSe].play();

        const {x, y} = req.player.coordinate;
        const player = this.players.find(x => x.id === req.player.id);
        const sprite = this.playerSprites[req.player.id];

        this.rotateHeadPlayer(sprite, {x, y});

        const idx = player.imageIndex * 3;

        if (player.isAI) {
            sprite.frame = sprite.frame === idx ? idx + 1 : idx;
        } else {
            if (++player.moveFrameCount > MOVE_FRAME_COUNT_LIMIT) {
                player.moveFrameCount = 0;
                sprite.frame = sprite.frame === idx ? idx + 1 : idx;
            }
        }

        // change position
        sprite.x = x;
        sprite.y = y;
    }

    onKillSheep (req) {
        this.game.assets[sheepDeathSe].play();

        const sheep = this.sheep;
        sheep.isAlive = false;

        this.addDeathOnProfile(sheep.id);

        const sprite = this.playerSprites[sheep.id];
        this.playerSprites[sheep.id].frame = this.deathFrames[sheep.id];

        // show corpse 3 sec
        setTimeout(() => {
            this.scene.removeChild(sprite);
        }, 3000);
    }

    onKillWolf (req) {
        this.game.assets[wolfDeathSe].play();

        const wolf = this.wolfs.find(x => x.id === req.player.id);
        wolf.isAlive = false;

        this.addDeathOnProfile(wolf.id);

        const sprite = this.playerSprites[wolf.id];
        sprite.frame = this.deathFrames[wolf.id];

        // show corpse 3 sec
        setTimeout(() => {
            this.scene.removeChild(sprite);
        }, 3000);
    }

    onRespawnWolf (req) {
        this.game.assets[respawnSe].play();

        const wolf = this.wolfs.find(x => x.id === req.player.id);
        wolf.isAlive = true;
        wolf.coordinate = req.player.coordinate;

        const sprite = this.playerSprites[wolf.id];
        const profile = this.profileSprites[wolf.id];

        sprite.x = wolf.coordinate.x;
        sprite.y = wolf.coordinate.y;
        sprite.frame = this.deathFrames[wolf.id] - 2;
        this.scene.addChild(sprite);

        // remove death profile
        profile.frame = this.deathFrames[wolf.id] - 2;
        this.scene.removeChild(this.blackBoxes[wolf.id]);

        // beep character image
        const respawnIntervalId = setInterval(() => {
            profile.opacity = profile.opacity ? 0 : 1;
            sprite.opacity = sprite.opacity ? 0 : 1;
        }, 200);

        setTimeout(() => {
            clearInterval(respawnIntervalId);
            profile.opacity = 1;
            sprite.opacity = 1;
        }, 2000);
        //end beep
    }

    onTakeNormalItem (req) {
        this.game.assets[foodSe].play();

        const item = this.normalItems.find(x => x.id === req.normalItem.id);
        item.enabled = false;

        const sprite = this.normalItemSprites[item.id];
        this.scene.removeChild(sprite);
    }

    onTakePowerItem (req) {
        this.game.assets[powerUpSe].play();

        const item = this.powerItems.find(x => x.id === req.powerItem.id);
        item.enabled = false;

        const sprite = this.powerItemSprites[item.id];
        this.scene.removeChild(sprite);
    }

    onStartInvincible () {
        if (this.isEnded) { return; }

        this.isInvincible = true;

        const sheep = this.sheep;
        sheep.imageIndex = 5;
        sheep.moveFrameCount = 0;

        this.playerSprites[sheep.id].frame = 3 * 5;
        this.profileSprites[sheep.id].frame = 3 * 5;

        bgmController.stop();
        bgmController.play(powerup1Bgm);
    }

    onEndInvincible () {
        if (this.isEnded) { return; }

        this.isInvincible = false;

        const sheep = this.sheep;
        sheep.imageIndex = 0;
        sheep.moveFrameCount = 0;

        this.playerSprites[sheep.id].frame = 0;
        this.profileSprites[sheep.id].frame = 0;

        bgmController.stop();
        bgmController.play(this.bgm);
    }

    onBomb () {
        this.game.assets[bombSe].play();

        this.scene.addChild(this.bombEffect);
        setTimeout(() => {
            this.scene.removeChild(this.bombEffect);
        }, 2000);

        this.wolfs.forEach(wolf => {
            if (wolf.isEnemy && wolf.isAlive) {
                wolf.isAlive = false;
                this.game.assets[wolfDeathSe].play();

                this.addDeathOnProfile(wolf.id);

                const sprite = this.playerSprites[wolf.id];
                sprite.frame = this.deathFrames[wolf.id];

                //show corpse 3 sec
                setTimeout(() => {
                    this.scene.removeChild(sprite);
                }, 3000);
            }
        });
    }

    onStartSlow () {
        this.playerSprites[this.sheep.id].scale(0.5, 0.5);

        if (myId === this.sheep.id){
            this.mySpeed = SLOW_SPEED;
        }
    }

    onEndSlow () {
        const sheep = this.sheep;
        const sprite = this.playerSprites[sheep.id];

        sprite.scale(2,2);

        if (myId == sheep.id) {
            this.mySpeed = SHEEP_SPEED;

            // adjust incase pixel
            let {x, y} = sprite;
            x -= (x - GAME_OFFSET_X) % SHEEP_SPEED;
            y -= (y - GAME_OFFSET_Y) % SHEEP_SPEED;

            if (x !== sprite.x || y !== sprite.y) {
                sprite.x = x;
                sprite.y = y;
                socket.movePlayer({x, y});
            }
        }
    }

    onEndGame (req) {
        socket.removeAllListeners(); // TODO: remove this line

        this.game.assets[gameBgm].stop();
        this.game.assets[endSe].play();

        this.isEnded = true;
        this.isTimeLimit = req.isTimeLimit;

        this.stateSprite.image = this.game.assets[finishImg];

        this.scene.addChild(this.stateSprite);
        setTimeout(() => {
            this.scene.removeChild(this.stateSprite);
            goToResultScene(this.game, req.game);
        }, 2000);
    }

    onUpdateScore (scores) {
        this.updateScores(scores.score);
    }

    // First move the player. If the player's new location has resulted
    // in the player being in a "hit" zone, then back the player up to
    // its original location. Tweak "hits" by "offset" pixels.
    onMyPlayerEnterFrame () {
        this.enterMove();

        const myPlayer = this.myPlayer;
        const mySprite = this.mySprite;

        // kill by sheepId
        if (myId === this.sheep.id && myPlayer.isAlive) {
            this.wolfs
                .filter(wolf => wolf.isAlive)
                .forEach(wolf => {
                    if (this.playerSprites[wolf.id].intersect(mySprite)) {
                        if (this.isInvincible) {
                            socket.killWolf({wolfId: wolf.id});
                            wolf.isAlive = false;
                        } else {
                            socket.killSheep();
                            myPlayer.isAlive = false;
                            return false;
                        }
                    }
                });

            // check sheep intersect with items
            this.normalItems
                .filter(item => item.enabled)
                .forEach(item => {
                    if (this.normalItemSprites[item.id].intersect(mySprite)){
                        item.enabled = false;
                        socket.takeNormalItem({itemId: item.id});
                    }
                });

            this.powerItems
                .filter(item => item.enabled)
                .forEach(item => {
                    if(this.powerItemSprites[item.id].intersect(mySprite)){
                        item.enabled = false;
                        socket.takePowerItem({itemId: item.id});
                    }
                });
        }
    }

    enterMove () {
        const mySprite = this.mySprite;
        const mySpeed  = this.mySpeed;

        for (let i = 0; i < 4; i++) {
            if (!this.game.input[DIRS[i]]) { continue; }

            let {x, y} = mySprite;
            x += DX[i] * mySpeed;
            y += DY[i] * mySpeed;

            // check the wall
            if (!this.hitTest({x, y})) {
                this.warpPortal({x, y});
                return;

            } else {
                // return to x old position
                x -= DX[i] * mySpeed;
                y -= DY[i] * mySpeed;

                // smooth turn
                for (let k = 0; k < 2; k++) {
                    const sign = k ? 1 : -1;

                    for (let j = mySpeed; j * 2 < pixel; j += mySpeed) {
                        let nx, ny;
                        if (DX[i]) {
                            nx = x + j * DX[i];
                            ny = y + j * sign;
                        } else {
                            nx = x + j * sign;
                            ny = y + j * DY[i];
                        }

                        if (!this.hitTest({x: nx, y: ny})) {
                            if (DX[i]) {
                                y += sign * mySpeed;
                            } else {
                                x += sign * mySpeed;
                            }

                            this.warpPortal({x, y});
                            return;
                        }
                    }
                }
            }
        }
    }

    rotateHeadPlayer (playerSprite, {x, y}) {
        if (playerSprite.x < x) { //right
            playerSprite.scaleX  = -1;
            playerSprite.rotation = 0;
        } else if (playerSprite.x > x){ // left
            playerSprite.scaleX  = 1;
            playerSprite.rotation = 0;
        } else if (playerSprite.y < y){ // down
            playerSprite.scaleX  = -1;
            playerSprite.rotation = 90;
        } else if (playerSprite.y > y){ // up
            playerSprite.scaleX  = -1;
            playerSprite.rotation = 270;
        }
    }

    hitTest ({x, y}) {
        x -= GAME_OFFSET_X;
        y -= GAME_OFFSET_Y;
        return this.map.hitTest(x, y) ||
            this.map.hitTest(x + pixel - 1, y) ||
            this.map.hitTest(x, y + pixel - 1) ||
            this.map.hitTest(x + pixel - 1, y + pixel - 1);
    }

    // check for warp portal at the border of map
    warpPortal({x, y}) {
        const mapXLimit = this.mapWidth * pixel - pixel / 2 + GAME_OFFSET_X;
        const mapYLimit = this.mapHeight * pixel - pixel / 2 + GAME_OFFSET_Y;

        if (x > mapXLimit){
            x = pixel / 2 + GAME_OFFSET_X;
        } else if (x < pixel / 2 + GAME_OFFSET_X){
            x = mapXLimit;
        } else if (y > mapYLimit){
            y = pixel/2 + GAME_OFFSET_Y;
        } else if (y < pixel / 2 + GAME_OFFSET_Y){
            y = mapYLimit;
        }

        socket.movePlayer({x, y});
    }

    addDeathOnProfile (id) {
        const profile = this.profileSprites[id];

        if (!this.blackBoxes[id]){
            const blackBox = new Sprite(180, 170);
            blackBox.image = this.game.assets[blackImg];
            blackBox.moveTo(profile.x - 60,profile.y - 30);
            blackBox.opacity = 0.5;
            this.blackBoxes[id] = blackBox;
        }

        this.scene.addChild(this.blackBoxes[id]);
        profile.frame = this.deathFrames[id];
    }

    getMapBgm (serverMap) {
        switch (serverMap.bgm){
            case 1: return gameBgm;
            case 2: return game2Bgm;
            case 3: return game3Bgm;
        }
    }
}
