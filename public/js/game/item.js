/**
 * http://usejsdoc.org/
 */
function initItem(game,itemPosition){
	 // Player for now will be a pixel x pixel.
    var item = new Sprite(pixel, pixel);
    item.image = game.assets[itemImg];
    
    //starting point
    item.x = itemPosition[0] * pixel;
    item.y = itemPosition[1] * pixel;

    item.frame = [18, 18];
    
    return item;
}