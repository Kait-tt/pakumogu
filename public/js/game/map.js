var mapImg = '/img/map.png';

function initDynamicMap(game,mapObj){
	// Create a map with 32x32 tiles
    var map = new Map(pixel, pixel);
    
    // Associate a tilesheet with the map.
    map.image = game.assets[mapImg]; 
    
    //recieve from server
    var collisionData = mapObj.tiles;
    
    // Tell the map which tiles should be where.
    map.loadData(collisionToBackGround(collisionData));

    // A Map's collisionData sets whether a tile corresponds to a
    // "hit" zone (1) or if it is "free" (0). "Hit" zones will be areas where
    // the player cannot go.
    map.collisionData = collisionData;
    
    return map;
}

function collisionToBackGround(collisionData){
	var backgrondData = new Array(collisionData.length);
	//console.log("collisionData.length : " + collisionData.length);
	for(var i=0;i<collisionData.length;i++){
		backgrondData[i] = new Array(collisionData[i].length);
		//console.log("collisionData[i].length : " + collisionData[i].length);
		for(var j=0;j<collisionData[i].length;j++){
			//0 = walkable
			if(collisionData[i][j] == 0){
				backgrondData[i][j] = 0; // sand
			}else {
				backgrondData[i][j] = 1; // block
			}
		}
	}
	return backgrondData;
}
