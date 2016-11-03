function goToResultScene(game, gameResult){
	resultObj.totalScore = gameResult.score;
	resultObj.item = gameResult.takeNormalItemCount;
	resultObj.powerItem = gameResult.takePowerItemCount;
	resultObj.wolfKill = gameResult.killCount;
	resultObj.timeLeft = gameResult.remainingTime / 1000;
		
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
	labelList.font = `36px ${normalFont}`;
	labelList.textAlign  = "right";
	labelList.moveTo(560,300);
	labelList.text =  "Item : <br>"+
					  "Power item : <br>"+
					  "Wolf kill : <br>"+
					  "Time left : <br>" +
					  "Total Score : <br>" +
					  "Sheep : <br>"+
					  "Wolf : <br>";
	labelList.width = 400;
	labelList.height = 730;
	endScene.addChild(labelList);
	
	var resultList = new Label();
	resultList.font = `36px ${normalFont}`;
	resultList.moveTo(960,300);
	resultList.textAlign  = "left";
	resultList.text = resultObj.item+"<br>"+
					  resultObj.powerItem+"<br>"+
					  resultObj.wolfKill+"<br>"+
					  resultObj.timeLeft+"<br>"+
					  resultObj.totalScore+"<br>"+
					  resultObj.sheepName+"<br>";
	for(var i=0;i<resultObj.wolfName.length;i++){
		resultList.text +=resultObj.wolfName[i]+"<br>";
	}
	resultList.width = 400;
	resultList.height = 730;
	endScene.addChild(resultList);
	
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
