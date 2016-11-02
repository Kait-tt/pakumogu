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
        this.remainingItemSize = 0;
        this.timeLimit = 0;
        this.killCount = 0;
        this.remainingTime = 0;
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
        ['id', 'mapId', 'state', 'startedAt', 'map', 'normalItems', 'powerItems', 'remainingItemSize', 'timeLimit', 'remainingTime', 'killCount'].forEach(key => {
            res[key] = this[key];
        });
        res.players = this.players.map(x => x.serialize());
        return res;
    }
}

module.exports = Game;
