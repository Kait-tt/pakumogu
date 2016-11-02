
var mySpeed = 8;
var SHEEP_SPEED = 8;
var WOLF_SPEED = 6;
var pixel = 64;
var DIRS = ['up', 'right', 'down', 'left'];
var DX   = [0, 1, 0, -1];
var DY   = [-1, 0, 1, 0];
var sheepId;
var isInvincible;
var wolfImageIndex = 0;

function initPlayScene(userObj, mapObj, normalItemObj, powerItemObj, game) {
    isInvincible = false;
    
    //start the music
	game.assets[startSe].play();
	game.assets[gameBgm].play();
    
	var scene = new Scene();
	//add scene environment
	var bg = new Sprite(1920, 1080);
	bg.image = game.assets[gameImg];
	scene.addChild(bg);
	
	//left side
	var hightScoreTxt = new Label("Highest score :");
	hightScoreTxt.font = '36px Arial, Helvetica, sans-serif';
	hightScoreTxt.moveTo(60,170);
	scene.addChild(hightScoreTxt);
	var currentScoreTxt = new Label("current score :");
	currentScoreTxt.font = '36px Arial, Helvetica, sans-serif';
	currentScoreTxt.moveTo(60,350);
	scene.addChild(currentScoreTxt);
	var timeTxt = new Label("time :");
	timeTxt.font = '36px Arial, Helvetica, sans-serif';
	timeTxt.moveTo(60,530);
	scene.addChild(timeTxt);
	
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
	for(let i=0;i<userObj.length;i++){
		var objId = userObj[i].id;
		//set right side profile
		var player = new Sprite(pixel, pixel);
	    player.image = game.assets[charImg];
	    
	    //if enemy = wolf
	    if(userObj[i].isEnemy){
	        // wolf
	        userObj[i].imageIndex = wolfImageIndex % 4 + 1;
	        ++wolfImageIndex;
	    }else{
	        // sheep
	        userObj[i].imageIndex = 0;
	    }
	
	    let i1 = userObj[i].imageIndex * 3;
	    let i2 = i1 + 1;
	    player.frame = [i1, i1, i1, i1, i2, i2, i2, i2];
	    
	    deathFrame[objId] = i1+2;
	    
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
	    var usernameTag = new Label(nameTag);
	    usernameTag.font = '36px Arial, Helvetica, sans-serif';
	    usernameTag.moveTo(fixPosition[i][0] + 50 ,fixPosition[i][1]+120);
	    scene.addChild(usernameTag);
	    //end right side profile
	}
	
    socket.on('movePlayer', (req) => {
    	game.assets[footStepsSe].play();
    	
        const {x, y} = req.player.coordinate;
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
        
        //change position
        character[objId].x = x;
        character[objId].y = y;
    });

    socket.on('killSheep', (req) => {
        const sheep = userObj.find(x => !x.isEnemy);
        sheep.isAlive = false;
        scene.removeChild(character[sheep.id]);

    	game.assets[sheepDeathSe].play();

    	addDeathOnProfile(game,scene,cProfile,sheep.id,deathFrame);
    	
    });

    socket.on('killWolf', (req) => {
        const wolf = userObj.find(x => x.id === req.player.id);
        wolf.isAlive = false;
        scene.removeChild(character[wolf.id]);
        game.assets[wolfDeathSe].play();
        
        //gray profile by sprite overlay
        //170 x 160
        addDeathOnProfile(game,scene,cProfile,wolf.id,deathFrame);
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
        isInvincible = true;
        // enable super mode
        character[sheepId].frame = [0, 1];
        
        game.assets[gameBgm].stop();
        game.assets[powerup1Bgm].play();
    });

    socket.on('endInvincible', () => {
        isInvincible = false;
        // disable super mode
        character[sheepId].frame = [0, 0, 0, 0, 1, 1, 1, 1];
        
        game.assets[gameBgm].play();
        game.assets[powerup1Bgm].stop();
    });

    socket.on('endGame', () => {
        game.assets[gameBgm].stop();
        game.assets[endSe].play();
        console.log('end game');
        //goToResultScene(game);
    });
    
    game.replaceScene(scene);
}

function initPlayer(game,map,socket,userObj){
	 // Player for now will be a pixel x pixel.
    var player = new Sprite(pixel, pixel);
    player.image = game.assets[charImg];
    
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

    let i1 = userObj.imageIndex * 3;
    let i2 = i1 + 1;
    player.frame = [i1, i1, i1, i1, i2, i2, i2, i2];
    
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

function addDeathOnProfile(game,scene,cProfile,id,deathFrame){
	var blackBox = new Sprite(180, 170);
    blackBox.image = game.assets[blackImg];
    cProfile[id].frame = deathFrame[id]; //profile position
    blackBox.moveTo(cProfile[id].x-60,cProfile[id].y-30);
    blackBox.opacity = 0.5;
    scene.addChild(blackBox);
}
