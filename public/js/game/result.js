function goToResultScene(game, score){
	// start the music
	bgmController.stop();
	bgmController.play(resultPageBgm);

	//go to end screen
	var endScene = new Scene();
	//add scene environment
	var bg = new Sprite(1920, 1080);
	bg.image = game.assets[resultImg];
	endScene.addChild(bg);
	
	//560,330
	var labelList = new Label();
	labelList.font = `100px ${normalFont}`;
	labelList.moveTo(560,330);
	labelList.text = "Score <br>1<br>2<br>3<br>";
	labelList.width = 480;
	labelList.height = 730;
	endScene.addChild(labelList);
	var resultList = new Label();
	resultList.font = `100px ${normalFont}`;
	resultList.moveTo(560,330);
	resultList.textAlign  = "right";
	resultList.text = "";
	resultList.width = 820;
	resultList.height = 730;
	
	var endScore =[score,100,2000,30000];
	for(var i=0;i<endScore.length;i++){
		//$("#userList").append(userObj[i].user.username + "<br>");
		for(var j=5;j>(endScore[i].toString().length);j--){
			resultList.text += "0";
		}
		resultList.text += endScore[i] + "<br>";
	}
	
	endScene.addChild(resultList);

	var finishTxt = new Sprite(480,272);
	finishTxt.moveTo(1920/2-300, 1080/2-200);
	finishTxt.image = game.assets[finishImg];
	endScene.addChild(finishTxt);
	setTimeout(() => {
		endScene.removeChild(finishTxt);
	}, 1000);
	var backBt = new Button();
    backBt.initialize = (((_initialize) => function () {
        _initialize.call(this);
        this.font = `30px ${normalFont}`;
        this.text = "Back";
        this.moveTo(1100, 800);
        this.width = 240;
        this.height = 95;
        this.addEventListener(Event.TOUCH_START, function(){
        	game.assets[decisionSe].play();
    		goToTopScene(game);
        });
    })(backBt.initialize));
    backBt.initialize();
    endScene.addChild(backBt);
    
	game.replaceScene(endScene);
}
