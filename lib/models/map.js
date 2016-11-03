'use strict';
const _ = require('lodash');

class Map {
    // decision random map if mapId is null
    constructor (mapId = null) {
        const mapList = Map.mapList;
        let map = mapList.find(x => x.id === mapId);
        if (!map) {
            map = _.sample(mapList);
        }
        ['width', 'height', 'tiles', 'respawnPoints', 'bgm'].forEach(key => {
            this[key] = map.data[key];
        });
    }

    static get mapList () {
        return [
            {id: 1, data: require('../fixtures/maps/map1')},
            {id: 2, data: require('../fixtures/maps/map2')},
            {id: 3, data: require('../fixtures/maps/map3')}
        ];
    }
}

module.exports = Map;
