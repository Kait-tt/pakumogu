var beforeUsername = null;
function goToTopScene(game) {
    //start Top page 01
    var scene, label, bg;

    //BGM top page
    bgmController.stop();
    bgmController.play(topPageBgm);

    scene = new Scene();

    label = new Label("Username :");
    label.font = `12px ${normalFont}`;
    label.scale(3);
    label.moveTo(800, 340);

    bg = new Sprite(1920, 1080);
    bg.image = game.assets[bgImg];

    var tb = new InputTextBox();
    tb.value = beforeUsername;
    tb.scale(3);
    tb.moveTo(1075, 340);
    tb.width = 330;
    tb.height = 24;
    tb.placeholder = "Input username";

    var enterBt = new Button();
    enterBt.initialize = (((_initialize) => function () {
        _initialize.call(this);
        this.font = `100px ${normalFont}`;
        this.text = "Enter";
        this.moveTo(580, 440);
        this.width = 630;
        this.height = 190;
        this.addEventListener(Event.TOUCH_START, changeScreenToTitle2);
    })(enterBt.initialize));

    var startBt = new Button();
    startBt.initialize = (((_initialize) => function () {
        _initialize.call(this);
        this.font = `100px ${normalFont}`;
        this.text = "Start";
        this.moveTo(410, 380);
        this.width = 630;
        this.height = 190;
        this.addEventListener(Event.TOUCH_START, startGame);
    })(startBt.initialize));

    var backBt = new Button();
    backBt.initialize = (((_initialize) => function () {
        _initialize.call(this);
        this.font = `30px ${normalFont}`;
        this.text = "Back";
        this.moveTo(1110, 470);
        this.width = 240;
        this.height = 95;
        this.addEventListener(Event.TOUCH_START, changeScreenToTitle1);
    })(backBt.initialize));

    //sheep 560 * 316
    //position 235 * 680
    var sImg = new Sprite(560, 320);
    sImg.image = game.assets[sheepImg];
    sImg.moveTo(235, 680);

    //940 720
    var wImg = new Sprite(560, 320);
    wImg.image = game.assets[wolfImg];
    wImg.moveTo(910, 680);

    var userList = new Label();
    userList.font = `50px ${normalFont}`;
    userList.moveTo(1580,400);

    scene.addChild(bg);
    scene.addChild(label);
    scene.addChild(tb);
    enterBt.initialize();
    scene.addChild(enterBt);
    scene.addChild(sImg);
    scene.addChild(wImg);

    game.pushScene(scene);
    //End top page one

    function changeScreenToTitle1 () {
        //back button action
        game.assets[decisionSe].play();
        socket.leave();
        //change screen to Title 1 after leave
        //change to first background
        bg.image = game.assets[bgImg];
        //remove nodes
        scene.removeChild(startBt);
        scene.removeChild(backBt);
        scene.removeChild(userList);

        //add nodes
        scene.addChild(label);
        scene.addChild(tb);
        enterBt.initialize();
        scene.addChild(enterBt);
    }

    function changeScreenToTitle2 () {
        game.assets[decisionSe].play();
        var username = tb.value;
        beforeUsername = username;
        socket.join(username);
        //change screen to Title 2 after join
        //change to second background
        bg.image = game.assets[bg2Img];
        //remove label, textbox and enterButton
        scene.removeChild(label);
        scene.removeChild(tb);
        scene.removeChild(enterBt);

        //add new startButton
        startBt.initialize();
        backBt.initialize();
        scene.addChild(startBt);
        scene.addChild(backBt);
        scene.addChild(userList);
    }

    function startGame () {
        game.assets[decisionSe].play();
        game.assets[topPageBgm].stop();

        socket.initGame();
        socket.startGame();
    }

    //prepare socket
    socket.removeAllListeners();

    socket.on('joinRoom', (req) => {
        updateUserList(req.game.players, userList);
    });

    socket.on('leaveRoom', (req) => {
        updateUserList(req.game.players, userList);
    });

    socket.on('yourInfo', (req) => {
        myId = req.id;
    });

    socket.on('initGame', (req) => {
    });

    socket.on('startGame', (req) => {
        initPlayScene(req.game.players, req.game.map, req.game.normalItems, req.game.powerItems,
            req.game.timeLimit, req.game.score, game);
    });
    //end prepare socket
}


function updateUserList(userObj,userList){
    userList.text = "";
    for(var i=0;i<userObj.length;i++){
        //$("#userList").append(userObj[i].user.username + "<br>");
        userList.text += userObj[i].user.username + "<br>";
    }
}
