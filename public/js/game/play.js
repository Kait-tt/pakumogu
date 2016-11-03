
var mySpeed = 8;
var SHEEP_SPEED = 8;
var WOLF_SPEED = 4;
var MOVE_FRAME_COUNT_LIMIT = 3;
var pixel = 64;
var DIRS = ['up', 'right', 'down', 'left'];
var DX   = [0, 1, 0, -1];
var DY   = [-1, 0, 1, 0];
var sheepId;
var isInvincible;
var isEnded;
var isTimeLimit;
var wolfImageIndex = 0;

function initPlayScene(userObj, mapObj, normalItemObj, powerItemObj, timeLimit, initScore, game) {
    isInvincible = false;
    isEnded = false;
    isTimeLimit = false;
    
    //stop the music
    bgmController.stop();
   
	var scene = new Scene();
	//add scene environment
	var bg = new Sprite(1920, 1080);
	bg.image = game.assets[gameImg];
	scene.addChild(bg);
	
	//left side
	var hightScoreTxt = new Label("Highest score :");
	hightScoreTxt.font = `36px ${normalFont}`;
	hightScoreTxt.moveTo(60,170);
	scene.addChild(hightScoreTxt);
	var currentScoreTxt = new Label("my score : " + ('00000' + initScore).slice(-5));
	currentScoreTxt.font = `36px ${normalFont}`;
	currentScoreTxt.moveTo(60,350);
	scene.addChild(currentScoreTxt);

	var map = initDynamicMap(game,mapObj);
	scene.addChild(map);

    //init all item before character
    var normalItemList = {};
    for(let i=0;i<normalItemObj.length;i++){
        //init item obj and assign to list for checking when sheep hit
        const item = initNormalItem(game,normalItemObj[i]);
        normalItemList[normalItemObj[i].id] = item;
        scene.addChild(item);
    }

    var powerItemList = {};
    for(let i=0;i<powerItemObj.length;i++){
        //init item obj and assign to list for checking when sheep hit
        const item = initPowerItem(game,powerItemObj[i]);
        powerItemList[powerItemObj[i].id] = item;
        scene.addChild(item);
    }
	
	//set right side screen position
	var fixPosition = [[1515,90], [1515,275],[1515,455],[1515,640],[1515,825]];
	
	//init all character
	var character = {};
	for(let i=0;i<userObj.length;i++){
		var objId = userObj[i].id;
		if(myId == objId){
			//set speed every move
            mySpeed = userObj[i].isEnemy ? WOLF_SPEED : SHEEP_SPEED;
		}
		character[objId] = initPlayer(game,map,socket,userObj[i]);
        if(myId == objId) {
            initPlayerMove(game, map, socket, character, userObj, mapObj, normalItemObj, normalItemList, powerItemObj, powerItemList);
        }
		// Add elements to scene.
    	scene.addChild(character[objId]);
    	
    	//set sheep id for killing
    	if(!userObj[i].isEnemy){
			sheepId = objId;
		}
	}
	
	wolfImageIndex = 0;
	var cProfile = {};
	var deathFrame = {};
	var blackBox = {};
	for(let i=0;i<userObj.length;i++){
		var objId = userObj[i].id;
		//set right side profile
		var player = new Sprite(pixel, pixel);
	    player.image = game.assets[charImg];
        player.frame = userObj[i].imageIndex * 3;

	    deathFrame[objId] = userObj[i].imageIndex * 3 + 2;
	    
	    //starting point
	    player.scale(3);
	    player.x = fixPosition[i][0] + 52;
	    player.y = fixPosition[i][1] + 25;
	    
	    cProfile[objId] = player;
	    
	    scene.addChild(cProfile[objId]);
	    
	    var nameTag = "AI";
	    if(null!=userObj[i].user){
	    	nameTag = userObj[i].user.username;
	    }
	    
	    //init username for result page
	    if(!userObj[i].isEnemy){
	    	resultObj.sheepName = nameTag;
		}else{
			resultObj.wolfName.push(nameTag);
		}
	    
	    var usernameTag = new Label(nameTag);
	    usernameTag.font = `36px ${normalFont}`;
	    usernameTag.moveTo(fixPosition[i][0] + 50 ,fixPosition[i][1] + 120);
	    scene.addChild(usernameTag);
	    //end right side profile
	}
	
	
	//add ready state
	var readyTxt = new Sprite(480,272);
	readyTxt.moveTo(1920/2-220, 1080/2-150);
	readyTxt.image = game.assets[readyImg];
	scene.addChild(readyTxt);
	setTimeout(() => {
		game.assets[startSe].play();
		readyTxt.image = game.assets[startImg];
		setTimeout(() => {
			scene.removeChild(readyTxt);
			socket.startGame();
			//change bgm by map data from server
			switch(mapObj.bgm){
				case 1: bgmController.play(gameBgm);
				break;
				case 2: bgmController.play(game2Bgm);
				break;
				case 3: bgmController.play(game3Bgm);
				break;
			}
			//count game time after start game
			var timeTxt = new Label("time : " + timeLimit / 1000);
			timeTxt.font = `36px ${normalFont}`;
			timeTxt.moveTo(60,530);
			scene.addChild(timeTxt);
		    var timeIntervalId = setInterval(() => {
		        if (isEnded) {
		            clearInterval(timeIntervalId);
		        }

		        if (isTimeLimit) {
		            timeLimit = 0;
		        } else if (!isEnded) {
		            timeLimit = Math.max(0, timeLimit - 1000);
		        }

		        timeTxt.text = "time : " + timeLimit / 1000;
		    }, 1000);
	    }, 500);
    }, 2000);

    socket.on('movePlayer', (req) => {
    	game.assets[footStepsSe].play();
    	
        const {x, y} = req.player.coordinate;
        var targetUser = userObj.find(x => x.id === req.player.id);
        var objId = req.player.id;

        //rotate head before change position
        //rotate character
        if(character[objId].x<x){ //right
        	character[objId].scaleX  = -1;
        	character[objId].rotation = 0;
        }else if(character[objId].x>x){ // left
        	character[objId].scaleX  = 1;
        	character[objId].rotation = 0;
        }else if(character[objId].y<y){ // down
        	character[objId].scaleX  = -1;
        	character[objId].rotation = 90;
        }else if(character[objId].y>y){ // up
        	character[objId].scaleX  = -1;
        	character[objId].rotation = 270;
        }

        const idx = targetUser.imageIndex * 3;

        if (targetUser.isAI) {
            character[objId].frame = character[objId].frame === idx ? idx + 1 : idx;
        } else {
            if (++targetUser.moveFrameCount > MOVE_FRAME_COUNT_LIMIT) {
                targetUser.moveFrameCount = 0;
                character[objId].frame = character[objId].frame === idx ? idx + 1 : idx;
            }
        }

        //change position
        character[objId].x = x;
        character[objId].y = y;
    });

    socket.on('killSheep', (req) => {
        const sheep = userObj.find(x => !x.isEnemy);
        sheep.isAlive = false;
        game.assets[sheepDeathSe].play();
        addDeathOnProfile(game,scene,cProfile,sheep.id,deathFrame,blackBox);
        character[sheep.id].frame = deathFrame[sheep.id];
        //show corpse 3 sec
        setTimeout(() => {
        	scene.removeChild(character[sheep.id]);
		}, 3000);
    });

    socket.on('killWolf', (req) => {
        const wolf = userObj.find(x => x.id === req.player.id);
        wolf.isAlive = false;
        game.assets[wolfDeathSe].play();
        addDeathOnProfile(game,scene,cProfile,wolf.id,deathFrame,blackBox);
        character[wolf.id].frame = deathFrame[wolf.id];
        //show corpse 3 sec
        setTimeout(() => {
        	scene.removeChild(character[wolf.id]);
		}, 3000);
    });

    socket.on('respawnWolf', (req) => {
        const wolf = userObj.find(x => x.id === req.player.id);
        wolf.isAlive = true;
        wolf.coordinate = req.player.coordinate;
        character[wolf.id].x = wolf.coordinate.x;
        character[wolf.id].y = wolf.coordinate.y;
        scene.addChild(character[wolf.id]);
        //remove death profile
        cProfile[wolf.id].frame = deathFrame[wolf.id]-2;
        scene.removeChild(blackBox[wolf.id]);
        
        //beep character image
        var respawnIntervalId = setInterval(() => {
        	cProfile[wolf.id].opacity = (cProfile[wolf.id].opacity==0)? 1:0;    
        	character[wolf.id].opacity = (character[wolf.id].opacity==0)? 1:0;
	    }, 200);
        
        setTimeout(() => {
        	clearInterval(respawnIntervalId);
        	cProfile[wolf.id].opacity = 1;    
	        character[wolf.id].opacity = 1;
		}, 2000);
        //end beep
    });

    socket.on('takeNormalItem', (req) => {
        const targetItemObj = normalItemObj.find(x => x.id === req.normalItem.id);
        targetItemObj.enabled = false;

        const item = normalItemList[targetItemObj.id];
        scene.removeChild(item);
        game.assets[foodSe].play();
    });

    socket.on('takePowerItem', (req) => {
        const targetItemObj = powerItemObj.find(x => x.id === req.powerItem.id);
        targetItemObj.enabled = false;

        const item = powerItemList[targetItemObj.id];
        scene.removeChild(item);
        game.assets[powerUpSe].play();
    });

    socket.on('startInvincible', () => {
        if (isEnded) { return; }

        isInvincible = true;

        const sheep = userObj.find(x => x.id === sheepId);
        sheep.imageIndex = 5;
        sheep.moveFrameCount = 0;
        cProfile[sheepId].frame = 3 * 5;

        bgmController.stop();
        bgmController.play(powerup1Bgm);
    });

    socket.on('endInvincible', () => {
        if (isEnded) { return; }

        isInvincible = false;

        const sheep = userObj.find(x => x.id === sheepId);
        sheep.imageIndex = 0;
        sheep.moveFrameCount = 0;
        cProfile[sheepId].frame = 0;

        bgmController.stop();
        bgmController.play(gameBgm);
    });

    socket.on('bomb', () => {
        // bomb effect and kill all wolfs
    });

    socket.on('startSlow', () => {
        // slow sheep speed
    });

    socket.on('endSlow', () => {
        // restore slow
    });

    socket.on('endGame', (req) => {
        socket.removeAllListeners();

        isEnded = true;
        isTimeLimit = req.isTimeLimit;
        game.assets[gameBgm].stop();
        game.assets[endSe].play();
        
    	readyTxt.image = game.assets[finishImg];
    	scene.addChild(readyTxt);
    	setTimeout(() => {
    		scene.removeChild(readyTxt);
    		goToResultScene(game, req.game);
    	}, 2000);
    });

    socket.on('updateScore', (scores) => {
        currentScoreTxt.text = "current score : " + ('00000' + scores.score).slice(-5);
    });
    
    game.replaceScene(scene);
}

function initPlayer(game,map,socket,userObj){
	 // Player for now will be a pixel x pixel.
    var player = new Sprite(pixel, pixel);
    player.image = game.assets[charImg];

    //count for change frame
    userObj.moveFrameCount = 0;
    
    //starting point
    player.x = userObj.coordinate.x;
    player.y = userObj.coordinate.y;
    
    //if enemy = wolf
    if(userObj.isEnemy){
        // wolf
        userObj.imageIndex = wolfImageIndex % 4 + 1;
        ++wolfImageIndex;
    }else{
        // sheep
        userObj.imageIndex = 0;
    }

    player.frame = userObj.imageIndex * 3;
    
    return player;
}

function initPlayerMove(game, map, socket, character, userObj, mapObj, normalItemObj, normalItemList, powerItemObj, powerItemList)  {
    const myUserObj = userObj.find(x => x.id === myId);
    const myCharacter = character[myId];

    // Let player move within bounds.
    myCharacter.addEventListener(Event.ENTER_FRAME, function () {
        // First move the player. If the player's new location has resulted
        // in the player being in a "hit" zone, then back the player up to
        // its original location. Tweak "hits" by "offset" pixels.

        let {x, y} = myCharacter;
        DIRS.forEach((dir, i) => {
            if (!game.input[dir]) { return; }
            x += DX[i] * mySpeed;
            y += DY[i] * mySpeed;
            
            //check the wall
            if (!myHitTest(map, x, y)) {
            	//check for warp portal at the border of map
            	warpPortal(x, y, mapObj);
            }else{
            	//smooth turn
            	var autoMovePixcel = mySpeed;
            	var xGhost = x-gameOffSetX;
            	var yGhost = y-gameOffSetY;
            	for(var j=(pixel/(-2*autoMovePixcel));(j*autoMovePixcel)<(pixel/2);j++){
            		if(j!=0){
            			if(DX[i] != 0){ //user go right or left
            				yGhost = y + (autoMovePixcel*j) - gameOffSetY; //DX not zero change Y
            			}else{//user go up and down DY not zero change X
            				xGhost = x + (autoMovePixcel*j) - gameOffSetX; 
            			}
	            		if(!(map.hitTest(xGhost, yGhost) ||
	    	                    map.hitTest(xGhost + pixel - 1, yGhost) ||
	    	                    map.hitTest(xGhost, yGhost + pixel - 1) ||
	    	                    map.hitTest(xGhost + pixel - 1, yGhost + pixel - 1))){
	            			
	            			if(DX[i] != 0){
	            				x -= DX[i] * mySpeed; //return to x old position
	            				(j<0)?y -= 1 * mySpeed:y += 1 * mySpeed;
	            			}else{
	            				y -= DY[i] * mySpeed;
	            				(j<0)?x -= 1 * mySpeed:x += 1 * mySpeed;
	            			}
	            			j = 5;
		                	warpPortal(x, y, mapObj);
	            		}
            		}
            	}
            	//end smooth turn
            }
        });

        // kill by sheepId
        if (myId === sheepId && myUserObj.isAlive) {
            for (let i = 0; i < userObj.length; i++) {
                if (userObj[i] === myUserObj) { continue; }
                if (!userObj[i].isAlive) { continue; }
                if (character[userObj[i].id].intersect(myCharacter)) {
                    if (isInvincible) {
                        socket.killWolf({wolfId: userObj[i].id});
                        userObj[i].isAlive = false;
                    } else {
                    	//sheep invincible for test
                        socket.killSheep();
                        myUserObj.isAlive = false;
                        break;
                    }
                }
            }

            //check sheep intersect with item
            for(let i=0;i<normalItemObj.length;i++){
                if (!normalItemObj[i].enabled) { continue; }

                const item = normalItemList[normalItemObj[i].id];
                if(myCharacter.intersect(item)){
                    normalItemObj[i].enabled = false;
                    socket.takeNormalItem({itemId: normalItemObj[i].id});
                }
            }

            for(let i=0;i<powerItemObj.length;i++){
                if (!powerItemObj[i].enabled) { continue; }

                const item = powerItemList[powerItemObj[i].id];
                if(myCharacter.intersect(item)){
                    powerItemObj[i].enabled = false;
                    socket.takePowerItem({itemId: powerItemObj[i].id});
                }
            }
        }
    });
}

function myHitTest (map, x, y) {
	x -= gameOffSetX;
	y -= gameOffSetY;
    return map.hitTest(x, y) ||
        map.hitTest(x + pixel - 1, y) ||
        map.hitTest(x, y + pixel - 1) ||
        map.hitTest(x + pixel - 1, y + pixel - 1);
}

function warpPortal(x, y, mapObj){
	var mapXLimit = (mapObj.width * pixel)-(pixel/2) + gameOffSetX;
	var mapYLimit = (mapObj.height * pixel)-(pixel/2) + gameOffSetY;
	if(x>mapXLimit){
		x = pixel/2 + gameOffSetX;
	}else if(x<pixel/2 + gameOffSetX){
		x = mapXLimit;
	}else if(y>mapYLimit){
		y = pixel/2 + gameOffSetY;
	}else if(y<pixel/2 + gameOffSetY){
		y = mapYLimit;
	}
	socket.movePlayer({x, y});
}

function addDeathOnProfile(game,scene,cProfile,id,deathFrame,blackBoxList){
	if(!blackBoxList[id]){
		var blackBox = new Sprite(180, 170);
	    blackBox.image = game.assets[blackImg];
	    blackBox.moveTo(cProfile[id].x-60,cProfile[id].y-30);
	    blackBox.opacity = 0.5;
	    blackBoxList[id] = blackBox;
	}
    scene.addChild(blackBoxList[id]);
    cProfile[id].frame = deathFrame[id]; //profile position
}
