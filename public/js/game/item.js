var itemImg = '/img/map.png';
function initItem(game,initItemObj){
	 // Player for now will be a pixel x pixel.
    var item = new Sprite(pixel, pixel);
    item.image = game.assets[itemImg];
    
    //starting point
    item.x = initItemObj.coordinate.x + gameOffSetX;
    item.y = initItemObj.coordinate.y + gameOffSetY;

    item.frame = [2, 2];
    
    return item;
}
