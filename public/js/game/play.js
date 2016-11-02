
var mySpeed = 8;
var SHEEP_SPEED = 8;
var WOLF_SPEED = 6;
var pixel = 64;
var DIRS = ['up', 'right', 'down', 'left'];
var DX   = [0, 1, 0, -1];
var DY   = [-1, 0, 1, 0];
var sheepId;

function initPlayScene(userObj,mapObj,normalItemObj, game) {
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
        const item = initItem(game,normalItemObj[i]);
        normalItemList[normalItemObj[i].id] = item;
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
        	initPlayerMove(game, map, socket, character, userObj, mapObj);
        }
		// Add elements to scene.
    	scene.addChild(character[objId]);
    	
    	//set sheep id for killing
    	if(!userObj[i].isEnemy){
			sheepId = objId;
		}
    	
    	//set right side profile
    	var player = new Sprite(pixel, pixel);
        player.image = game.assets[charImg];
        //if enemy = wolf
        if(userObj[i].isEnemy){
        	player.frame = [3, 3, 3, 3, 4, 4, 4, 4]; // wolf
        }else{
        	player.frame = [0, 0, 0, 0, 1, 1, 1, 1]; // sheep
        }
        
        //starting point
        player.scale(3);
        player.x = fixPosition[i][0] + 50;
        player.y = fixPosition[i][1] + 20;
        
        scene.addChild(player);
        
        var nameTag = "AI";
        if(null!=userObj[i].user){
        	nameTag = userObj[i].user.username;
        }
        var usernameTag = new Label(nameTag);
        usernameTag.font = '36px Arial, Helvetica, sans-serif';
        usernameTag.moveTo(fixPosition[i][0] + 50 ,fixPosition[i][1]+120);
        scene.addChild(usernameTag);
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

        //kill by sheepId
        if(sheepId!=objId && character[sheepId].intersect(character[objId])) {
        	scene.removeChild(character[sheepId]);
        }else if(sheepId == objId){//the move object is sheep
        	//check sheep intersect with item
        	for(let i=0;i<normalItemObj.length;i++){
                if (!normalItemObj[i].enabled) { continue; }

                const item = normalItemList[normalItemObj[i].id];
        		if(character[sheepId].intersect(item)){
                    socket.takeNormalItem({itemId: normalItemObj[i].id});
        		}
        	}
        }
    });

    socket.on('killSheep', (req) => {
    	scene.removeChild(character[sheepId]);
    });
    
    socket.on('takeNormalItem', (req) => {
        const targetItemObj = normalItemObj.find(x => x.id === req.normalItem.id);
        if (!targetItemObj.enabled) { return; }

        const item = normalItemList[targetItemObj.id];
        scene.removeChild(item);

        //item take effect - invincible

    })
    
    console.log("push scene");
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