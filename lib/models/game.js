'use strict';
const _ = require('lodash');
const ID_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

class Game {
    constructor ({mapId = 0} = {}) {
        this.id = this.generateId();
        this.mapId = mapId;
        this.players = [];
        this.state = Game.STATES.idle;
    }

    static generateId (size = 12) {
        return _.range(size).map(() => _.sample(ID_CHARS));
    }

    static get STATES () {
        return {
            idle: 'idle',
            init: 'init',
            running: 'running',
            ended: 'ended'
        }
    }
}

module.exports = Game;
