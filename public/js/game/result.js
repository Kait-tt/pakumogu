function goToResultScene(game, score){
	//go to end screen
	var endScene = new Scene();
	//add scene environment
	var bg = new Sprite(1920, 1080);
	bg.image = game.assets[resultImg];
	endScene.addChild(bg);
	
	//560,330
	var labelList = new Label();
	labelList.font = '100px Arial, Helvetica, sans-serif';
	labelList.moveTo(560,330);
	labelList.text = "Score <br>1<br>2<br>3<br>";
	labelList.width = 480;
	labelList.height = 730;
	endScene.addChild(labelList);
	var resultList = new Label();
	resultList.font = '100px Arial, Helvetica, sans-serif';
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

	var backLabel = new Label();
	backLabel.font = '24px Arial, Helvetica, sans-serif';
	backLabel.moveTo(1380,1000);
	backLabel.text = "back";
	endScene.addChild(backLabel);
	backLabel.addEventListener(Event.TOUCH_START, () => {
		game.assets[decisionSe].play();
		goToTopScene(game);
	});

	game.replaceScene(endScene);
}
