var itemImg = '/img/map.png';
function initPowerItem(game, initItemObj){
    var item = new Sprite(pixel, pixel);
    item.image = game.assets[itemImg];

    item.x = initItemObj.coordinate.x;
    item.y = initItemObj.coordinate.y;

    item.frame = [3, 3];
    
    return item;
}
