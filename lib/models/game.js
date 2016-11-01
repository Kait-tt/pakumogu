'use strict';
const _ = require('lodash');
const ID_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

class Game {
    constructor () {
        this.id = Game.generateId();
        this.players = [];
        this.state = Game.STATES.idle;
        this.map = null;
        this.startedAt = null;
        this.normalItems = null;
    }

    static generateId (size = 12) {
        return _.range(size).map(() => _.sample(ID_CHARS)).join('');
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
        ['id', 'mapId', 'state', 'startedAt', 'map', 'normalItems'].forEach(key => {
            res[key] = this[key];
        });
        res.players = this.players.map(x => x.serialize());
        return res;
    }
}

module.exports = Game;
