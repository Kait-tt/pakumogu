var itemImg = '/img/map.png';
const powerItemFrame = [
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    7, 7, 7, 7, 7, 8, 8, 8, 8, 8,
    7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 7, 7, 7, 7, 7
];

function initPowerItem(game, type = 'power'){
    var item = new Sprite(pixel, pixel);
    item.image = game.assets[itemImg];
    item.type = type;

    item.updatePowerFrame = () => {
        item.frame = powerItemFrame;
    };

    item.updateActualFrame = () => {
        if (item.type === 'power' || item.type === 'invincible') {
            item.frame = 3;
        } else if (type === 'bomb') {
            item.frame = 5;
        } else if (type === 'slow') {
            item.frame = 4;
        } else {
            throw new Error(`invalid power item type: ${type}`)
        }
    };

    item.updateActualFrame();

    return item;
}
