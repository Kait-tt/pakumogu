'use strict';
const Util = require('../modules/util');

class Game {
    constructor () {
        this.id = Util.generateId();
        this.players = [];
        this.state = Game.STATES.idle;
        this.map = null;
        this.startedAt = null;
        this.normalItems = null;
        this.powerItems = null;
    }

    static get STATES () {
        return {
            idle: 'idle',
            init: 'init',
            running: 'running',
            ended: 'ended'
        }
    }

    serialize () {
        const res = {};
        ['id', 'mapId', 'state', 'startedAt', 'map', 'normalItems', 'powerItems'].forEach(key => {
            res[key] = this[key];
        });
        res.players = this.players.map(x => x.serialize());
        return res;
    }
}

module.exports = Game;
