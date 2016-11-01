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
        const {id, mapId, state, startedAt} = this;
        const players = this.players.map(x => x.serialize());
        return {id, mapId, state, players, startedAt};
    }
}

module.exports = Game;
