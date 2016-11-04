class ResultPage {
	constructor (game) {
		this.game = game;

		this.scene = new Scene();

		// background image
		const bg = new Sprite(1920, 1080);
		bg.image = this.game.assets[resultImg];
		this.scene.addChild(bg);

		const scoreDetails = [
			{name: 'Item', base: scoreBasePoints.scoreNormalItemPoint},
			{name: 'Power item', base: scoreBasePoints.scorePowerItemPoint},
			{name: 'Wolf kill', base: scoreBasePoints.scoreKillPoint},
			{name: 'Time left', base: scoreBasePoints.scoreTimePoint * 10}
		];
		this.scoreDetails = scoreDetails;

		// item and kill score icon
		[[itemImg, 2, 20], [itemImg, 3, 10], [charImg, 5, 0]].forEach(([img, frame, offsetX], idx) => {
			const sprite = new Sprite(pixel, pixel);
			sprite.image = game.assets[img];
			sprite.frame = frame;
			sprite.x = 870 - offsetX;
			sprite.y = 320 + 42 * idx;
			this.scene.addChild(sprite);
		});

		// time unit label
		const timeUnitLabel = new Label('s');
		timeUnitLabel.font = `42px ${normalFont}`;
		timeUnitLabel.color = '#9f2077';
		timeUnitLabel.textAlign  = 'center';
		timeUnitLabel.x = 847;
		timeUnitLabel.y = 320 + 42 * 3;
		timeUnitLabel.width = 50;
		timeUnitLabel.height = 50;
		this.scene.addChild(timeUnitLabel);

		// detail score name label
		const detailNameLabel = new Label();
		detailNameLabel.font = `42px ${normalFont}`;
		detailNameLabel.color = '#9f2077';
		detailNameLabel.textAlign  = 'right';
		detailNameLabel.text = scoreDetails.map(a => a.name + ' :').join('<br>');
		detailNameLabel.x = 360;
		detailNameLabel.y = 320;
		detailNameLabel.width = 400;
		detailNameLabel.height = 730;
		this.scene.addChild(detailNameLabel);

		// detail score got point label
		const detailPointLabel = new Label();
		detailPointLabel.font = `42px ${normalFont}`;
		detailPointLabel.color = '#9f2077';
		detailPointLabel.textAlign  = 'right';
		detailPointLabel.x = 460;
		detailPointLabel.y = 320;
		detailPointLabel.width = 400;
		detailPointLabel.height = 730;
		this.scene.addChild(detailPointLabel);
		this.detailPointLabel = detailPointLabel;

		//  `x` label
		const crossLabel = new Label();
		crossLabel.font = `42px ${normalFont}`;
		crossLabel.color = '#9f2077';
		crossLabel.textAlign  = 'right';
		crossLabel.text = scoreDetails.map(a => '×').join('<br>');
		crossLabel.x = 590;
		crossLabel.y = 320;
		crossLabel.width = 400;
		crossLabel.height = 730;
		this.scene.addChild(crossLabel);

		// detail score base point label
		const detailScoreBasePointLabel = new Label();
		detailScoreBasePointLabel.font = `42px ${normalFont}`;
		detailScoreBasePointLabel.color = '#9f2077';
		detailScoreBasePointLabel.textAlign  = 'right';
		detailScoreBasePointLabel.text = scoreDetails.map(a => a.base + 'pt').join('<br>');
		detailScoreBasePointLabel.x = 745;
		detailScoreBasePointLabel.y = 320;
		detailScoreBasePointLabel.width = 400;
		detailScoreBasePointLabel.height = 730;
		this.scene.addChild(detailScoreBasePointLabel);

		// `=` label
		const equalLabel = new Label();
		equalLabel.font = `42px ${normalFont}`;
		equalLabel.color = '#9f2077';
		equalLabel.textAlign  = 'right';
		equalLabel.text = scoreDetails.map(a => '＝').join('<br>');
		equalLabel.x = 820;
		equalLabel.y = 320;
		equalLabel.width = 400;
		equalLabel.height = 730;
		this.scene.addChild(equalLabel);

		// detail score label
		const detailScoreLabel = new Label();
		detailScoreLabel.font = `42px ${normalFont}`;
		detailScoreLabel.color = '#9f2077';
		detailScoreLabel.textAlign  = 'right';
		detailScoreLabel.x = 990;
		detailScoreLabel.y = 320;
		detailScoreLabel.width = 400;
		detailScoreLabel.height = 730;
		this.scene.addChild(detailScoreLabel);
		this.detailScoreLabel = detailScoreLabel;

		// total score label
		const totalScoreLabel = new Label();
		totalScoreLabel.font = `82px ${normalFont}`;
		totalScoreLabel.color = '#9f2077';
		totalScoreLabel.textAlign  = 'center';
		totalScoreLabel.x = 610;
		totalScoreLabel.y = 540;
		totalScoreLabel.width = 700;
		totalScoreLabel.height = 100;
		this.scene.addChild(totalScoreLabel);
		this.totalScoreLabel = totalScoreLabel;

		// sheep and wolf
		const sheep = new Sprite(pixel, pixel);
		sheep.image = game.assets[charImg];
		sheep.frame = [0, 0, 0, 0, 1, 1, 1, 1];
		sheep.x = 700;
		sheep.y = 770;
		this.scene.addChild(sheep);

		const sheepLabel = new Label();
		sheepLabel.font = `30px ${normalFont}`;
		sheepLabel.textAlign = 'center';
		sheepLabel.color = '#9f2077';
		sheepLabel.x = sheep.x - 165;
		sheepLabel.y = sheep.y + 64;
		sheepLabel.width = 400;
		this.scene.addChild(sheepLabel);
		this.sheepLabel = sheepLabel;

		this.wolfLabels = [];
		for (let i = 0; i < 4; i++) {
			const wolf = new Sprite(pixel, pixel);
			wolf.image = game.assets[charImg];
			const i1  = (i + 1) * 5;
			const i2  = i1 + 1;
			wolf.frame = [i1, i1, i1, i1, i2, i2, i2, i2];
			wolf.x = [1023, 1014, 1049, 1023][i];
			wolf.y = 690 + 64 * i;
			this.scene.addChild(wolf);

			const wolfLabel = new Label();
			wolfLabel.font = `30px ${normalFont}`;
			wolfLabel.color = '#9f2077';
			wolfLabel.x = wolf.x + 90;
			wolfLabel.y = wolf.y + 15;
			this.wolfLabels.push(wolfLabel);
			this.scene.addChild(wolfLabel);
		}

		const backBt = new Label('Back', 'dark');
		backBt.font = `34px ${normalFont}`;
		backBt.text = 'Back';
		backBt.color = '#19199e';
		backBt.x = 1330;
		backBt.y = 1000;
		backBt.addEventListener(Event.TOUCH_START, function(){
			game.assets[decisionSe].play();
			topPage.init({entered: true});
		});
		this.scene.addChild(backBt);
	}

	init (serverGame) {
		bgmController.stop();
		bgmController.play(resultPageBgm);

		this.updateScores(serverGame);
		this.updateUsernames(serverGame.players);
		this.game.replaceScene(this.scene);
	}

	updateScores (scores) {
		const points = [scores.takeNormalItemCount, scores.takePowerItemCount, scores.killCount, scores.remainingTime / 1000];

		this.detailPointLabel.text = points.join('<br>');
		this.detailScoreLabel.text = this.scoreDetails.map((a, i) => points[i] * a.base + 'pt').join('<br>');
		this.totalScoreLabel.text = `TOTAL  :  ${scores.score} pt`;
	}

	updateUsernames (players) {
		let idx = 0;
		players.forEach(player => {
			const name = player.isAI ? 'AI' : player.user.username;

			if (player.isEnemy) {
				this.wolfLabels[idx++].text = `[${name}]`;
			} else {
				this.sheepLabel.text = `[${name}]`;
			}
		})
	}
}
