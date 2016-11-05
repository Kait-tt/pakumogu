'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
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
        this.takeInvincibleItemCount = 0;
        this.takeBombItemCount = 0;
        this.takeSlowItemCount = 0;
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
            'timeLimit', 'remainingTime', 'killCount', 'takeNormalItemCount', 'takePowerItemCount',
            'takeInvincibleItemCount', 'takeBombItemCount', 'takeSlowItemCount', 'score'
        ].forEach(key => {
            res[key] = this[key];
        });
        res.players = this.players.map(x => x.serialize());
        return res;
    }
    
    get takePowerItemCount () {
    	return this.takeInvincibleItemCount + this.takeBombItemCount + this.takeSlowItemCount;
    }

    updateScore () {
        const timeScore = Math.floor(this.remainingTime / 100) * config.scoreTimePoint;
        const normalItemScore = this.takeNormalItemCount * config.scoreNormalItemPoint;
        const powerItemScore = this.takePowerItemCount * config.scorePowerItemPoint;
        const killScore = this.killCount * config.scoreKillPoint;
        this.score = timeScore + normalItemScore + powerItemScore + killScore;
        return this.score;
    }

    logging () {
        const dist = path.join('logs', config.gameLogFileName);
        const data = JSON.stringify({
            id: this.id,
            mapId: this.map.id,
            remainingTime: this.remainingTime,
            killCount: this.killCount,
            takeNormalItemCount: this.takeNormalItemCount,
            takePowerItemCount: this.takePowerItemCount,
            takeInvincibleItemCount: this.takeInvincibleItemCount,
            takeBombItemCount: this.takeBombItemCount,
            takeSlowItemCount: this.takeSlowItemCount,
            score: this.score,
            player: this.players.map(player => ({
                isEnemy: player.isEnemy,
                isAI: player.isAI,
                username: player.user ? player.user.username : 'AI'
            }))
        }) + os.EOL;

        fs.writeFileSync(dist, data, {flag: 'a'});
    }
}

module.exports = Game;
