window.onload = enchantTopPage;

var bgImg = '/img/title1.png';
var bg2Img = '/img/title2.png';
var gameImg = '/img/game.png';
var sheepImg = '/img/sheep.png';
var wolfImg = '/img/wolf.png';
var charImg = '/img/chara.png';

var gameBgm = '/bgm/game1.mp3';
var topPageBgm = '/bgm/title_result.mp3';

var foodSe = '/se/Food.mp3';
var sheepDeathSe = '/se/Sheep_death.mp3';
var startSe = '/se/Start.mp3';
var footStepsSe = '/se/foot_steps.mp3';
var decisionSe = '/se/Decision.mp3';
var clearSe = '/se/Clear.mp3';
var endSe = '/se/end.mp3';

var socket;
var myId;

var gameOffSetX = 480;
var gameOffSetY = 40;


function enchantTopPage(){
	socket = new Socket();
	enchant();
	
	var game = new Core(1920, 1080);
	game.fps = 30;
	game.preload( 
			bgImg, bg2Img, gameImg, sheepImg, wolfImg, mapImg, charImg, itemImg, //img 
			gameBgm,  topPageBgm, //bgm
			foodSe, sheepDeathSe, startSe, footStepsSe, decisionSe, clearSe, endSe//se
			);
	game.onload = function () {
		//start Top page 01
		var scene, label, bg;
		
		//BGM top page
		game.assets[topPageBgm].play();

		scene = new Scene();

		label = new Label("Username :");
		label.scale(3);
		label.moveTo(800, 340);
		
		bg = new Sprite(1920, 1080);
		bg.image = game.assets[bgImg];
		
		var tb = new InputTextBox();
		tb.scale(3);
        tb.moveTo(1075, 340);
        tb.width = 330;
        tb.height = 24;
        tb.placeholder = "Input username";
        
        var enterBt = new Button();
        enterBt.font = "100px Arial, Helvetica, sans-serif";
        enterBt.text = "Enter";
        enterBt.moveTo(580, 440);
        enterBt.width = 630;
        enterBt.height = 190;
        
        var startBt = new Button();
        startBt.font = "100px Arial, Helvetica, sans-serif";
        startBt.text = "Start";
        startBt.moveTo(410, 380);
        startBt.width = 630;
        startBt.height = 190;
        
        var backBt = new Button();
        backBt.font = "30px Arial, Helvetica, sans-serif";
        backBt.text = "Back";
        backBt.moveTo(1110, 470);
        backBt.width = 240;
        backBt.height = 95;
        
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
        userList.font = '50px Arial, Helvetica, sans-serif';
		userList.moveTo(1580,400);
        
		scene.addChild(bg);
		scene.addChild(label);
		scene.addChild(tb);
		scene.addChild(enterBt);
		scene.addChild(sImg);
		scene.addChild(wImg);
		
		game.pushScene(scene);
		//End top page one
		
		//enter button event change screen to Title 2 
		enterBt.addEventListener(Event.TOUCH_START, function () {
			game.assets[decisionSe].play();
        	var username = tb.value;
    		socket.join(username);    		
    		//change screen to Title 2 after join
    		//change to second background
    		bg.image = game.assets[bg2Img];
    		//remove label, textbox and enterButton
    		scene.removeChild(label);
    		scene.removeChild(tb);
    		scene.removeChild(enterBt);
    		
    		//add new startButton
    		scene.addChild(startBt);
    		scene.addChild(backBt);
    		scene.addChild(userList);
        });
		
		//start button event start game
		startBt.addEventListener(Event.TOUCH_START, function () {
			game.assets[decisionSe].play();
			game.assets[topPageBgm].stop();
			
			socket.initGame();
		    socket.startGame();
		});
		
		//back button event
		backBt.addEventListener(Event.TOUCH_START, function () {
			//back button action
			game.assets[decisionSe].play();
			
		});
		
		//prepare socket
		socket.on('joinRoom', (req) => {
	        console.log('on join room', req);
	        updateUserList(req.game.players,userList);
	        
	    });
		
		socket.on('yourInfo', (req) => {
			myId = req.id;
		});

		socket.on('initGame', (req) => {
			console.log('on init game', req);
		});

	    socket.on('startGame', (req) => {
	        console.log('on start game', req);
	        initPlayScene(req.game.players, req.game.map, req.game.normalItems, game);
	    });
	    //end prepare socket
	};
	
	game.start();
	/*
	*/
}

function updateUserList(userObj,userList){
	userList.text = "";
	for(var i=0;i<userObj.length;i++){
		//$("#userList").append(userObj[i].user.username + "<br>");
		userList.text += userObj[i].user.username + "<br>";
	}
}