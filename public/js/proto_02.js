var mapImg = '/img/map.png';
var charImg = '/img/chara.png';
var mySpeed = 8;
var SHEEP_SPEED = 16;
var WOLF_SPEED = 12;
var pixel = 64;
var DIRS = ['up', 'right', 'down', 'left'];
var DX   = [0, 1, 0, -1];
var DY   = [-1, 0, 1, 0];
var sheepId;

function initGame(userObj,mapObj) {
	
	enchant();
    var game = new Core(mapObj.width * pixel, mapObj.height * pixel); //game dimension
    game.fps = 16;

    game.preload(mapImg, charImg);
    
    game.onload = function () {
    	
    	var map = initDynamicMap(game,mapObj);
    	game.rootScene.addChild(map);
    	
    	var character = {};
    	for(var i=0;i<userObj.length;i++){
    		var objId = userObj[i].id;
    		if(myId == objId){
    			//set speed every move
                mySpeed = userObj[i].isEnemy ? WOLF_SPEED : SHEEP_SPEED;
    		}
    		character[objId] = initPlayer(game,map,socket,userObj[i]);
            if(myId == objId) {
                initPlayerMove(game, map, socket, character[objId]);
            }
    		// Add elements to scene.
        	game.rootScene.addChild(character[objId]);
        	
        	//set sheep id for killing
        	if(!userObj[i].isEnemy){
    			sheepId = objId;
    		}
    	}
    	
    	console.log(character);
        socket.on('movePlayer', (req) => {
            const {x, y} = req.player.coordinate;
            var objId = req.player.id;
            character[objId].x = x;
            character[objId].y = y;
            
            //kill by sheepId
            if(sheepId!=objId && character[sheepId].intersect(character[objId])) {
            	game.rootScene.removeChild(character[sheepId]);
            }
        });
        
        
    };
    game.start();
}

function initPlayer(game,map,socket,userObj){
	 // Player for now will be a 36x36.
    var player = new Sprite(pixel, pixel);
    player.image = game.assets[charImg];
    
    //starting point
    player.x = userObj.coordinate.x * pixel;
    player.y = userObj.coordinate.y * pixel;

    
    //if enemy = brown
    if(userObj.isEnemy){
    	player.frame = [3, 3, 4, 4]; // wolf
    }else{
    	player.frame = [0, 0, 1, 1]; // sheep
    }
    
    return player;
}

function initPlayerMove(game, map, socket, player) {
    // Let player move within bounds.
    player.addEventListener(Event.ENTER_FRAME, function () {
        // First move the player. If the player's new location has resulted
        // in the player being in a "hit" zone, then back the player up to
        // its original location. Tweak "hits" by "offset" pixels.

        let {x, y} = player;
        DIRS.forEach((dir, i) => {
            if (!game.input[dir]) { return; }
            x += DX[i] * mySpeed;
            y += DY[i] * mySpeed;
        });

        if (!myHitTest(map, x, y)) {
            socket.movePlayer({x, y});
        }
    });
}

function myHitTest (map, x, y) {
    return map.hitTest(x, y) ||
        map.hitTest(x + pixel - 1, y) ||
        map.hitTest(x, y + pixel - 1) ||
        map.hitTest(x + pixel - 1, y + pixel - 1);
}
