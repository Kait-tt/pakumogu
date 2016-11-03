function goToResultScene(game, gameResult){
	// start the music
	bgmController.stop();
	bgmController.play(resultPageBgm);

	//go to end screen
	var endScene = new Scene();
	//add scene environment
	var bg = new Sprite(1920, 1080);
	bg.image = game.assets[resultImg];
	endScene.addChild(bg);

	var scoreDetails = [
		{name: 'Item', point: gameResult.takeNormalItemCount, base: scoreBasePoints.scoreNormalItemPoint},
		{name: 'Power item', point: gameResult.takePowerItemCount, base: scoreBasePoints.scorePowerItemPoint},
		{name: 'Wolf kill', point: gameResult.killCount, base: scoreBasePoints.scoreKillPoint},
		{name: 'Time left', point: gameResult.remainingTime / 1000, base: scoreBasePoints.scoreTimePoint * 10}
	];

	[[itemImg, 2, 20], [itemImg, 3, 10], [charImg, 5, 0]].forEach(([img, frame, offsetX], idx) => {
		var sprite = new Sprite(pixel, pixel);
		sprite.image = game.assets[img];
		sprite.frame = frame;
		sprite.x = 870 - offsetX;
		sprite.y = 320 + 42 * idx;
		endScene.addChild(sprite);
	});

	var timeLabel = new Label();
	timeLabel.font = `42px ${normalFont}`;
	timeLabel.color = '#9f2077';
	timeLabel.textAlign  = 'center';
	timeLabel.text = 's';
	timeLabel.x = 847;
	timeLabel.y = 320 + 42 * 3;
	timeLabel.width = 50;
	timeLabel.height = 50;
	endScene.addChild(timeLabel);

	var detailNameLabel = new Label();
	detailNameLabel.font = `42px ${normalFont}`;
	detailNameLabel.color = '#9f2077';
	detailNameLabel.textAlign  = 'right';
	detailNameLabel.text = scoreDetails.map(a => a.name + ' :').join('<br>');
	detailNameLabel.x = 360;
	detailNameLabel.y = 320;
	detailNameLabel.width = 400;
	detailNameLabel.height = 730;
	endScene.addChild(detailNameLabel);

	var detailPointLabel = new Label();
	detailPointLabel.font = `42px ${normalFont}`;
	detailPointLabel.color = '#9f2077';
	detailPointLabel.textAlign  = 'right';
	detailPointLabel.text = scoreDetails.map(a => a.point).join('<br>');
	detailPointLabel.x = 460;
	detailPointLabel.y = 320;
	detailPointLabel.width = 400;
	detailPointLabel.height = 730;
	endScene.addChild(detailPointLabel);

	var crossLabel = new Label();
	crossLabel.font = `42px ${normalFont}`;
	crossLabel.color = '#9f2077';
	crossLabel.textAlign  = 'right';
	crossLabel.text = scoreDetails.map(a => '×').join('<br>');
	crossLabel.x = 590;
	crossLabel.y = 320;
	crossLabel.width = 400;
	crossLabel.height = 730;
	endScene.addChild(crossLabel);

	var detailScoreBasePointLabel = new Label();
	detailScoreBasePointLabel.font = `42px ${normalFont}`;
	detailScoreBasePointLabel.color = '#9f2077';
	detailScoreBasePointLabel.textAlign  = 'right';
	detailScoreBasePointLabel.text = scoreDetails.map(a => a.base + 'pt').join('<br>');
	detailScoreBasePointLabel.x = 745;
	detailScoreBasePointLabel.y = 320;
	detailScoreBasePointLabel.width = 400;
	detailScoreBasePointLabel.height = 730;
	endScene.addChild(detailScoreBasePointLabel);

	var equalLabel = new Label();
	equalLabel.font = `42px ${normalFont}`;
	equalLabel.color = '#9f2077';
	equalLabel.textAlign  = 'right';
	equalLabel.text = scoreDetails.map(a => '＝').join('<br>');
	equalLabel.x = 820;
	equalLabel.y = 320;
	equalLabel.width = 400;
	equalLabel.height = 730;
	endScene.addChild(equalLabel);

	var detailScoreLabel = new Label();
	detailScoreLabel.font = `42px ${normalFont}`;
	detailScoreLabel.color = '#9f2077';
	detailScoreLabel.textAlign  = 'right';
	detailScoreLabel.text = scoreDetails.map(a => a.point * a.base + 'pt').join('<br>');
	detailScoreLabel.x = 990;
	detailScoreLabel.y = 320;
	detailScoreLabel.width = 400;
	detailScoreLabel.height = 730;
	endScene.addChild(detailScoreLabel);

	var totalScoreLabel = new Label();
	totalScoreLabel.font = `82px ${normalFont}`;
	totalScoreLabel.color = '#9f2077';
	totalScoreLabel.textAlign  = 'center';
	totalScoreLabel.text = 'Total  :  ' + gameResult.score + ' pt';
	totalScoreLabel.x = 610;
	totalScoreLabel.y = 540;
	totalScoreLabel.width = 700;
	totalScoreLabel.height = 100;
	endScene.addChild(totalScoreLabel);

	// sheep and wolf
	var sheep = new Sprite(pixel, pixel);
	sheep.image = game.assets[charImg];
	sheep.frame = [0, 0, 0, 0, 1, 1, 1, 1];
	sheep.x = 700;
	sheep.y = 770;
	endScene.addChild(sheep);

	var sheepPlayer = gameResult.players.find(x => !x.isEnemy);
	var sheepLabel = new Label();
	sheepLabel.font = `30px ${normalFont}`;
	sheepLabel.textAlign = 'center';
	sheepLabel.color = '#9f2077';
	sheepLabel.text = '[' + (sheepPlayer.isAI ? 'AI' : sheepPlayer.user.username) + ']';
	sheepLabel.x = sheep.x - 165;
	sheepLabel.y = sheep.y + 64;
	sheepLabel.width = 400;
	endScene.addChild(sheepLabel);

	gameResult.players.filter(x => x.isEnemy).forEach((player, idx) => {
		var wolf = new Sprite(pixel, pixel);
		wolf.image = game.assets[charImg];
		var i1  = 3 * (idx + 1);
		var i2  = i1 + 1;
		wolf.frame = [i1, i1, i1, i1, i2, i2, i2, i2];
		wolf.x = [1023, 1014, 1049, 1023][idx];
		wolf.y = 690 + 64 * idx;
		endScene.addChild(wolf);

		var wolfLabel = new Label();
		wolfLabel.font = `30px ${normalFont}`;
		wolfLabel.color = '#9f2077';
		wolfLabel.text = '[' + (player.isAI ? 'AI' : player.user.username) + ']';
		wolfLabel.x = wolf.x + 90;
		wolfLabel.y = wolf.y + 15;
		endScene.addChild(wolfLabel);
	});
	
	var backBt = new Button('Back', 'dark');
	backBt.font = `30px ${normalFont}`;
	backBt.text = 'Back';
	backBt.x = 1280;
	backBt.y = 1000;
	backBt.width = 140;
	backBt.height = 55;
	backBt.addEventListener(Event.TOUCH_START, function(){
		game.assets[decisionSe].play();
		goToTopScene(game);
	});
    endScene.addChild(backBt);

	game.replaceScene(endScene);
}
