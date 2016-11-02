var charImg = '/img/chara.png';
var mySpeed = 8;
var SHEEP_SPEED = 8;
var WOLF_SPEED = 6;
var pixel = 64;
var fps = 30;
var DIRS = ['up', 'right', 'down', 'left'];
var DX   = [0, 1, 0, -1];
var DY   = [-1, 0, 1, 0];
var sheepId;
var isInvincible;

function initGame(userObj,mapObj,normalItemObj,powerItemObj) {
    isInvincible = false;
	
	enchant();
    var game = new Core(mapObj.width * pixel, mapObj.height * pixel); //game dimension
    game.fps = fps;

    game.preload(mapImg, charImg, itemImg);
    
    game.onload = function () {
    	
    	var map = initDynamicMap(game,mapObj);
    	game.rootScene.addChild(map);
    	
    	//init all item
    	var normalItemList = {};
    	for(let i=0;i<normalItemObj.length;i++){
    		//init item obj and assign to list for checking when sheep hit
            const item = initNormalItem(game,normalItemObj[i]);
            normalItemList[normalItemObj[i].id] = item;
    		game.rootScene.addChild(item);
    	}

    	var powerItemList = {};
        for(let i=0;i<powerItemObj.length;i++){
            //init item obj and assign to list for checking when sheep hit
            const item = initPowerItem(game,powerItemObj[i]);
            powerItemList[powerItemObj[i].id] = item;
            game.rootScene.addChild(item);
        }

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
            game.rootScene.addChild(character[objId]);

            //set sheep id for killing
            if(!userObj[i].isEnemy){
                sheepId = objId;
            }
        }
    	
        socket.on('movePlayer', (req) => {
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
            game.rootScene.removeChild(character[sheep.id]);
        });

        socket.on('killWolf', (req) => {
            const wolf = userObj.find(x => x.id === req.player.id);
            wolf.isAlive = false;
            game.rootScene.removeChild(character[wolf.id]);
        });
        
        socket.on('takeNormalItem', (req) => {
            const targetItemObj = normalItemObj.find(x => x.id === req.normalItem.id);
            targetItemObj.enabled = false;

            const item = normalItemList[targetItemObj.id];
            game.rootScene.removeChild(item);
        });

        socket.on('takePowerItem', (req) => {
            const targetItemObj = powerItemObj.find(x => x.id === req.powerItem.id);
            targetItemObj.enabled = false;

            const item = powerItemList[targetItemObj.id];
            game.rootScene.removeChild(item);
        });

        socket.on('startInvincible', () => {
            console.log('start invincible');
            isInvincible = true;

            // enable super mode
            character[sheepId].frame = [0, 1];
        });

        socket.on('endInvincible', () => {
            console.log('end invincible');
            isInvincible = false;

            // disable super mode
            character[sheepId].frame = [0, 0, 0, 0, 1, 1, 1, 1];
        });
    };
    game.start();
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
    	player.frame = [3, 3, 3, 3, 4, 4, 4, 4]; // wolf
    }else{
    	player.frame = [0, 0, 0, 0, 1, 1, 1, 1]; // sheep
    }
    
    return player;
}

function initPlayerMove(game, map, socket, character, userObj, mapObj, normalItemObj, normalItemList, powerItemObj, powerItemList) {
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
                    console.log(isInvincible);
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
                    console.log(`take ${powerItemObj[i].id}`);
                    socket.takePowerItem({itemId: powerItemObj[i].id});
                }
            }
        }
    });
}

function myHitTest (map, x, y) {
    return map.hitTest(x, y) ||
        map.hitTest(x + pixel - 1, y) ||
        map.hitTest(x, y + pixel - 1) ||
        map.hitTest(x + pixel - 1, y + pixel - 1);
}


function warpPortal(x, y, mapObj){
	var mapXLimit = (mapObj.width * pixel)-(pixel/2);
	var mapYLimit = (mapObj.height * pixel)-(pixel/2);
	if(x>mapXLimit){
		x = pixel/2;
	}else if(x<pixel/2){
		x = mapXLimit;
	}else if(y>mapYLimit){
		y = pixel/2;
	}else if(y<pixel/2){
		y = mapYLimit;
	}
	socket.movePlayer({x, y});
}
