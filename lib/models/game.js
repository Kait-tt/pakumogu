'use strict';
const Util = require('../modules/util');
const config = require('../modules/config');

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
        this.takeNormalItemCount = 0;
        this.takePowerItemCount = 0;
        this.remainingTime = 0;
        this.score = 0;
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
        [
            'id', 'mapId', 'state', 'startedAt', 'map', 'normalItems', 'powerItems', 'remainingItemSize',
            'timeLimit', 'remainingTime', 'killCount', 'takeNormalItemCount', 'takePowerItemCount', 'score'
        ].forEach(key => {
            res[key] = this[key];
        });
        res.players = this.players.map(x => x.serialize());
        return res;
    }

    updateScore () {
        const timeScore = Math.floor(this.remainingTime / 100) * config.scoreTimePoint;
        const normalItemScore = this.takeNormalItemCount * config.scoreNormalItemPoint;
        const powerItemScore = this.takePowerItemCount * config.scorePowerItemPoint;
        const killScore = this.killCount * config.scoreKillPoint;
        this.score = timeScore + normalItemScore + powerItemScore + killScore;
        return this.score;
    }
}

module.exports = Game;
