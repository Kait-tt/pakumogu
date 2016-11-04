var itemImg = '/img/map.png';
function initNormalItem(game){
    var item = new Sprite(pixel, pixel);
    item.image = game.assets[itemImg];
    item.frame = 2;
    
    return item;
}
