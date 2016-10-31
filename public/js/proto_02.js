/**
 * http://usejsdoc.org/
 */


window.onload = initGame;
enchant();

var mapImg = '/img/map1.png';
var charImg = '/img/chara1.png';

function initGame() {
    var game = new Core(640, 640); //game dimension
    game.fps = 16;

    game.preload(mapImg, charImg);

    var socket = new Socket();
    socket.join(getRequest('user'));
    
    socket.on('joinRoom', ({user}) => {
        console.log('on join room');
    });
    
    //only user xx can start game
    if(getRequest('user') == 'xx'){
    	socket.on('initGame', () => {
	        console.log('on init game');
	        socket.initGame();
	    });
	
	    socket.on('startGame', () => {
	        console.log('on start game');
	        socket.startGame();
	    });
    }
    //end start game socket
    
    game.onload = function () {
    	
    	var map = initMap(game);
        
        var player = initPlayer(game,map,socket,'xx');
        var player2 = initPlayer(game,map,socket,'yy');

        socket.on('movePlayer', (req) => {
            // const playerId = req.player.id;
            const {x, y} = req.player.coordinate;
            console.log("username : " + req.player.user.username);
            if(req.player.user.username == 'xx'){
	            player.x = x;
	            player.y = y;
            }else{
            	player2.x = x;
	            player2.y = y;
            }
        });
        
        // Add elements to scene.
        game.rootScene.addChild(map);
        game.rootScene.addChild(player);
        game.rootScene.addChild(player2);
    };
    game.start();
}

function initMap(game){
	// Create a map with 16x16 tiles
    var map = new Map(32, 32);
    
    // Associate a tilesheet with the map.
    map.image = game.assets[mapImg]; 
    
    // Tell the map which tiles should be where.
    map.loadData(
        // Background tiles: grass: 0, sand: 2.
        // Each tile 16 px, 20x20 tiles, total 320x320
        [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0], 
        [0, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0], 
        [0, 0, 2, 2, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0], 
        [0, 0, 2, 2, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0], 
        [0, 0, 2, 2, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0], 
        [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 0], 
        [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 0], 
        [0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0], 
        [0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0], 
        [0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0], 
        [0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0], 
        [0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0], 
        [0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0], 
        [0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
        /*
        ,
        // Overlay layer.
        // -1 means "nothing", water: 1, flowers: 18, shrub 23.
        [
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,  1,  1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 18, -1, -1, -1,  1,  1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,  1, -1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 
        [-1, -1, -1, -1, -1, 23, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 23, -1, -1, -1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1,  1,  1,  1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1,  1,  1,  1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1,  1,  1,  1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 
        [-1, -1, -1, 18, -1, -1, -1, -1, -1,  1,  1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 
        [-1, 23, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 23, -1, -1], 
        [-1, 23, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 23, 23, -1], 
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
    ]*/
    );

    // A Map's collisionData sets whether a tile corresponds to a
    // "hit" zone (1) or if it is "free" (0). "Hit" zones will be areas where
    // the player cannot go.
    map.collisionData = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 
        [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], 
        [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1], 
        [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1], 
        [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1], 
        [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1], 
        [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1], 
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1], 
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1], 
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1], 
        [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1], 
        [1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1], 
        [1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1], 
        [1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1], 
        [1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], 
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1], 
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1], 
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    return map;
}

function initPlayer(game,map,socket,userId){
	 // Player for now will be a 36x36.
    var player = new Sprite(32, 32);
    player.image = game.assets[charImg];
    player.x = 16 * 2;
    player.y = 16 * 2;
    player.speed = 16;
    
    //switch player character by user id
    if(userId == 'xx'){
    	player.frame = [6, 6, 7, 7]; //brown
    }else{
    	player.frame = [1, 1, 2, 2]; // white
    }

    var x = player.x;
    var y = player.y;
    
    // Let player move within bounds.
    player.addEventListener(Event.ENTER_FRAME, function () {
    	// First move the player. If the player's new location has resulted
        // in the player being in a "hit" zone, then back the player up to
        // its original location. Tweak "hits" by "offset" pixels.
    	var xoffset = 0;
    	var yoffset = 0;
        if (game.input.up) {            // Move up
            y -= player.speed;
            if (map.hitTest(x + xoffset, y + yoffset)) {
                y += player.speed;
            }
        }
        else if (game.input.down) {     // Move down
            y += player.speed;
            if (map.hitTest(x + xoffset, y + yoffset)) {
                y -= player.speed;
            }
        }
        else if (game.input.left) {     // Move left
            x -= player.speed;
            if (map.hitTest(x + xoffset, y + yoffset)) {
                x += player.speed;
            }
        }
        else if (game.input.right) {    // Move right
            x += player.speed;
            if (map.hitTest(x + xoffset, y + yoffset)) {
                x -= player.speed;
            }
        }

        if (x !== player.x || y !== player.y) {
            socket.movePlayer({x, y});
        }
    });
    
    return player;
}

function getRequest(name){
	   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
	      return decodeURIComponent(name[1]);
}