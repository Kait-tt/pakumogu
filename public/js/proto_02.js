/**
 * http://usejsdoc.org/
 */

var mapImg = '/img/map64.png';
var charImg = '/img/chara64.png';
var mySpeed = 8;
var SHEEP_SPEED = 16;
var WOLF_SPEED = 12;
var pixel = 64;

function initGame(userObj,mapObj) {
	
	enchant();
    var game = new Core(mapObj.width * pixel, mapObj.height * pixel); //game dimension
    game.fps = 16;

    game.preload(mapImg, charImg);
    
    game.onload = function () {
    	
    	var map = initDynamicMap(game,mapObj);
    	game.rootScene.addChild(map);
    	
    	var character =[];
    	for(var i=0;i<userObj.length;i++){
    		var objId = userObj[i].user.id;
    		if(myId == objId){
    			//set speed every move
                if(userObj[i].isEnemy){
                	mySpeed = WOLF_SPEED;
                }else{
                	mySpeed = SHEEP_SPEED;
                }
    		}
    		character[objId] = initPlayer(game,map,socket,userObj[i]);
    		// Add elements to scene.
        	game.rootScene.addChild(character[objId]);
    	}
    	
    	console.log(character);
        socket.on('movePlayer', (req) => {
            const {x, y} = req.player.coordinate;
            var objId = req.player.user.id;
            character[objId].x = x;
            character[objId].y = y;
        });
        
        
    };
    game.start();
}

function initPlayer(game,map,socket,userObj){
	 // Player for now will be a 36x36.
    var player = new Sprite(pixel, pixel);
    player.image = game.assets[charImg];
    
    //starting point
    player.x = pixel;
    player.y = pixel;
   
    
    //if enemy = brown
    if(userObj.isEnemy){
    	player.frame = [1, 1, 2, 2]; //white
    }else{
    	player.frame = [6, 6, 7, 7]; //brown
    }

    var x = player.x;
    var y = player.y;
    
    // Let player move within bounds.
    player.addEventListener(Event.ENTER_FRAME, function () {
    	// First move the player. If the player's new location has resulted
        // in the player being in a "hit" zone, then back the player up to
        // its original location. Tweak "hits" by "offset" pixels.
    	var xoffset = pixel/2;
    	var yoffset = pixel/2;
        if (game.input.up) {            // Move up
            y -= mySpeed;
            if (map.hitTest(x + xoffset, y + yoffset)) {
                y += mySpeed;
            }
            socket.movePlayer({x, y});
        }
        else if (game.input.down) {     // Move down
            y += mySpeed;
            if (map.hitTest(x + xoffset, y + yoffset)) {
                y -= mySpeed;
            }
            socket.movePlayer({x, y});
        }
        else if (game.input.left) {     // Move left
            x -= mySpeed;
            if (map.hitTest(x + xoffset, y + yoffset)) {
                x += mySpeed;
            }
            socket.movePlayer({x, y});
        }
        else if (game.input.right) {    // Move right
            x += mySpeed;
            if (map.hitTest(x + xoffset, y + yoffset)) {
                x -= mySpeed;
            }
            socket.movePlayer({x, y});
        }

        /*if (x !== player.x || y !== player.y) {
        	socket.movePlayer({x, y});
        }*/
    });
    
    return player;
}

function getRequest(name){
	   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
	      return decodeURIComponent(name[1]);
}