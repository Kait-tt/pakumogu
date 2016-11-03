var itemImg = '/img/map.png';
function initPowerItem(game, initItemObj, type = 'power'){
    var item = new Sprite(pixel, pixel);
    item.image = game.assets[itemImg];

    item.x = initItemObj.coordinate.x;
    item.y = initItemObj.coordinate.y;

    if (type === 'invincible' || type === 'power') {
        item.frame = 3;
    } else if (type === 'bomb') {
        item.frame = 4;
    } else if (type === 'slow') {
        item.frame = 5;
    } else {
        throw new Error(`invalid power item type: ${type}`)
    }
    
    return item;
}
