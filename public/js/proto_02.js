var charImg = '/img/chara.png';
var mySpeed = 8;
var SHEEP_SPEED = 8;
var WOLF_SPEED = 6;
var pixel = 64;
var DIRS = ['up', 'right', 'down', 'left'];
var DX   = [0, 1, 0, -1];
var DY   = [-1, 0, 1, 0];
var sheepId;

function initGame(userObj,mapObj) {
	
	enchant();
    var game = new Core(mapObj.width * pixel, mapObj.height * pixel); //game dimension
    game.fps = 30;

    game.preload(mapImg, charImg, itemImg);
    
    game.onload = function () {
    	
    	var map = initDynamicMap(game,mapObj);
    	game.rootScene.addChild(map);
    	
    	//init all character
    	var character = {};
    	for(var i=0;i<userObj.length;i++){
    		var objId = userObj[i].id;
    		if(myId == objId){
    			//set speed every move
                mySpeed = userObj[i].isEnemy ? WOLF_SPEED : SHEEP_SPEED;
    		}
    		character[objId] = initPlayer(game,map,socket,userObj[i]);
            if(myId == objId) {
            	initPlayerMove(game, map, socket, character, userObj, mapObj);
            }
    		// Add elements to scene.
        	game.rootScene.addChild(character[objId]);
        	
        	//set sheep id for killing
        	if(!userObj[i].isEnemy){
    			sheepId = objId;
    		}
    	}
    	
    	//init item
    	var itemPosition = [ [1,1], [1,4] ];
    	var itemList = [];
    	for(var i=0;i<itemPosition.length;i++){
    		//init item obj and assign to list for checking when sheep hit
    		itemList[i] = initItem(game,itemPosition[i]);
    		game.rootScene.addChild(itemList[i]);
    	}
    	
    	
    	console.log(character);
        socket.on('movePlayer', (req) => {
            const {x, y} = req.player.coordinate;
            console.log(req.player);
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

            //kill by sheepId
            if(sheepId!=objId && character[sheepId].intersect(character[objId])) {
            	game.rootScene.removeChild(character[sheepId]);
            }else if(sheepId == objId){//the move object is sheep
            	//check sheep intersect with item
            	for(var i=0;i<itemList.length;i++){
            		if(character[sheepId].intersect(itemList[i])){
            			//remove item after hit
            			game.rootScene.removeChild(itemList[i]);
            			
            			//item take effect - invincible

            		}
            	}
            }
        });

        socket.on('killSheep', (req) => {
        	game.rootScene.removeChild(character[sheepId]);
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

function initPlayerMove(game, map, socket, character, userObj, mapObj) {
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
            if (userObj.filter(x => x.id !== myId && x.isAlive).some(x => character[x.id].intersect(myCharacter))) {
            		socket.killSheep();
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
