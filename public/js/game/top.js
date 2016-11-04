class TopPage {
    constructor (game) {
        this.game = game;
        this.scene = new Scene();
        this.enabled = false;

        // background image
        this.bg = new Sprite(1920, 1080);
        this.bg.image = this.game.assets[bgImg];
        this.scene.addChild(this.bg);

        // username label
        this.usernameLabel = new Label('Username :');
        this.usernameLabel.font = `12px ${normalFont}`;
        this.usernameLabel.scale(3);
        this.usernameLabel.moveTo(800, 340);

        // input text for username
        this.usernameInputBox = new InputTextBox();
        this.usernameInputBox.scale(3);
        this.usernameInputBox.moveTo(1075, 340);
        this.usernameInputBox.width = 330;
        this.usernameInputBox.height = 24;
        this.usernameInputBox.placeholder = 'Input your name';

        // joined user list label
        this.userList = new Label();
        this.userList.font = `50px ${normalFont}`;
        this.userList.moveTo(1580,400);
        
        // sprite animate
        const pixel = 64;
        this.sImg = new Sprite(pixel, pixel);
        this.sImg.image = game.assets[charImg];
        this.sImg.frame = [0,0,0,1,1,1];
        this.sImg.scale(-2,2);
        this.sImg.moveTo(235, 700);

        this.sImg.tl.moveBy(300, 0, 90)
            .scaleTo(2, 2, 10)
            .moveBy(-300, 0, 90)
            .scaleTo(-2, 2, 10)
            .loop();
        
        this.wolfImageIndex = 0;
        this.wImgList = [];
        for(let i=0;i<4;i++){
        	const wImg = new Sprite(pixel, pixel);
        	wImg.image = game.assets[charImg];
    	    
    	    ++this.wolfImageIndex;
    	    const fIndex = (this.wolfImageIndex % 4 + 1) * 5;
    	    wImg.frame = [fIndex,fIndex,fIndex,fIndex+1,fIndex+1,fIndex+1];
    	    wImg.scale(-2,2);
    	    const timeOffSet = (i*5);
    	    wImg.tl.moveBy(300+(timeOffSet), 0, 30+(timeOffSet))
            .scaleTo(2, 2, 10)
            .moveBy(0, -10, 5).moveBy(0, 10, 5)
            .moveBy(0, -10, 5).moveBy(0, 10, 5)
            .moveBy(0, -10, 5).moveBy(0, 10, 5)
            .moveBy(-300-(timeOffSet), 0, 30+(timeOffSet))
            .scaleTo(-2, 2, 10)
            .loop();
    	    
    	    wImg.moveTo(800 + (i*150), 700);
    	    this.wImgList[i] = wImg;
        }

        // enter button
        this.enterButton = new Button();
        this.enterButton.initialize = (((_initialize) => () => {
            _initialize.call(this.enterButton);
            this.enterButton.font = `100px ${normalFont}`;
            this.enterButton.text = 'Enter';
            this.enterButton.moveTo(580, 440);
            this.enterButton.width = 630;
            this.enterButton.height = 190;
            this.enterButton.on(Event.TOUCH_START, () => {
                this.game.assets[decisionSe].play();
                const username = this.usernameInputBox.value;
                if (username.trim()) {
                    socket.join(username);
                }
            });
        })(this.enterButton.initialize));

        // start button
        this.startButton = new Button();
        this.startButton.initialize = (((_initialize) => () => {
            _initialize.call(this.startButton);
            this.startButton.font = `100px ${normalFont}`;
            this.startButton.text = 'Start';
            this.startButton.moveTo(410, 380);
            this.startButton.width = 630;
            this.startButton.height = 190;
            this.startButton.on(Event.TOUCH_START, () => {
                this.game.assets[decisionSe].play();
                socket.initGame();
            });
        })(this.startButton.initialize));

        // back button
        this.backButton = new Button();
        this.backButton.initialize = (((_initialize) => () => {
            _initialize.call(this.backButton);
            this.backButton.font = `30px ${normalFont}`;
            this.backButton.text = 'Back';
            this.backButton.moveTo(1110, 470);
            this.backButton.width = 240;
            this.backButton.height = 95;
            this.backButton.on(Event.TOUCH_START, () => {
                this.game.assets[decisionSe].play();
                socket.leave();
                this.changeScreenToTop1();
            });
        })(this.backButton.initialize));

        // set socket events
        socket.on('joinRoom', (req) => {
            if (!this.enabled) { return; }
            this.updateUserList(req.game.players);
        });

        socket.on('leaveRoom', (req) => {
            if (!this.enabled) { return; }
            this.updateUserList(req.game.players);
        });

        socket.on('yourInfo', (req) => {
            if (!this.enabled) { return; }
            myId = req.id;
            this.changeScreenToTop2();
        });

        socket.on('initGame', (req) => {
            playPage.init(req.game);
            this.enabled = false;
        });
    }

    init ({entered = false} = {}) {
        // bgm
        bgmController.stop();
        bgmController.play(topPageBgm);

        this.enabled = true;
        this.game.replaceScene(this.scene);

        if (entered) {
            this.changeScreenToTop1();
            const username = this.usernameInputBox.value;
            socket.join(username);
            this.changeScreenToTop2();
        } else {
            this.changeScreenToTop1();
        }
    }

    changeScreenToTop1 () {
        // remove nodes
        this.scene.removeChild(this.startButton);
        this.scene.removeChild(this.backButton);
        this.scene.removeChild(this.userList);

        // add nodes
        this.enterButton.initialize();
        this.scene.addChild(this.usernameLabel);
        this.scene.addChild(this.usernameInputBox);
        this.scene.addChild(this.enterButton);
        this.scene.addChild(this.sImg);
        for(let i=0;i<this.wImgList.length;i++){
        	this.scene.addChild(this.wImgList[i]);
        }
    }

    changeScreenToTop2 () {
        // remove nodes
        this.scene.removeChild(this.usernameLabel);
        this.scene.removeChild(this.usernameInputBox);
        this.scene.removeChild(this.enterButton);
        this.scene.removeChild(this.sImg);
        for(let i=0;i<this.wImgList.length;i++){
        	this.scene.removeChild(this.wImgList[i]);
        }

        // add nodes
        this.startButton.initialize();
        this.backButton.initialize();
        this.scene.addChild(this.startButton);
        this.scene.addChild(this.backButton);
        this.scene.addChild(this.userList);
    }

    updateUserList (players) {
        this.userList.text = players.filter(player => player.user).map(player => player.user.username).join('<br>');
    }
}
