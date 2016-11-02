var itemImg = '/img/map.png';
function initNormalItem(game, initItemObj){
    var item = new Sprite(pixel, pixel);
    item.image = game.assets[itemImg];

    item.x = initItemObj.coordinate.x;
    item.y = initItemObj.coordinate.y;

    item.frame = [2, 2];
    
    return item;
}
