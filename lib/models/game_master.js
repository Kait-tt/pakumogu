'use strict';
const _ = require('lodash');
const EventEmitter2 = require('eventemitter2');
const config = require('../modules/config');
const Game = require('./game');
const Player = require('./player');
const Map = require('./map');
const NormalItem = require('./normal_item');
const PowerItem = require('./power_item');
const EnemyAI1 = require('./enemy_ai1');

class GameMaster extends EventEmitter2 {
    constructor (pixel = 64) {
        super({});
        this.game = null;

        this.pixel = pixel;
        this.invincibleTimeoutId = null;

        this.timeoutIds = [];
        this.intervalIds = [];

        this.decideSheepCount = {};
    }

    createGame () {
        this.game = new Game();
        return this.game;
    }

    reCreateGame () {
        this.timeoutIds.forEach(id => clearTimeout(id));
        this.timeoutIds = [];
        this.intervalIds.forEach(id => clearInterval(id));
        this.intervalIds = [];
        this.createGame();
    }

    addPlayer (user) {
        if (this.game.state !== Game.STATES.idle) {
            throw new Error('cannot add game player after init game');
        }

        if (this.game.players.size >= config.playerSize) {
            throw new Error(`cannot add over ${config.playerSize} players`);
        }

        const player = new Player({user, isAI: false});
        this.game.players.push(player);
    }

    removePlayer (user) {
        if (this.game.state === Game.STATES.running) {
            const player = this.game.players.find(x => x.user === user);
            if (player) {
                player.isAI = true;
            }
        } else {
            _.remove(this.game.players, player => player.user === user);
        }
    }

    decideSheep (players) {
        let minNum = 10000000;

        const sheep = _.chain(players)
            .filter(x => x.user)
            .map(x => {
                const id = x.id + '__' + x.user.username;
                const num = this.decideSheepCount[id] || 0;
                minNum = Math.min(minNum, num);
                return {id, num, player: x};
            })
            .filter(x => x.num === minNum)
            .sample()
            .value();

        this.decideSheepCount[sheep.id] = sheep.num + 1;

        return sheep.player;
    }

    initGame () {
        if (this.game.state !== Game.STATES.idle) {
            throw new Error('cannot add game player after start game');
        }
        this.game.state = Game.STATES.init;

        this.game.timeLimit = config.gameTimeLimit;
        this.game.remainingTime = config.gameTimeLimit;

        const users = this.game.players.filter(x => !x.isAI);
        if (!users.length) {
            throw new Error('cannot start game joined no user');
        }

        // decide sheep
        const sheep = this.decideSheep(this.game.players);
        this.game.players.forEach(player => {
            player.isEnemy = player !== sheep;
        });

        // add AI
        while (this.game.players.length < config.playerSize) {
            const player = new Player({isEnemy: true, isAI: true});
            this.game.players.push(player);
        }

        // decide map
        this.game.map = new Map();

        // init coordinate of each players
        _.sampleSize(this.game.map.respawnPoints, config.playerSize).forEach(({x, y}, idx) => {
            this.game.players[idx].coordinate.x = x;
            this.game.players[idx].coordinate.y = y;
        });

        // init power item
        this.game.powerItems = [];
        _.times(config.defaultPowerItemSize, () => {
            const item = new PowerItem({x: 0, y: 0});
            do {
                item.coordinate.x = _.random(this.game.map.width - 1);
                item.coordinate.y = _.random(this.game.map.height - 1);
            } while (this.game.map.tiles[item.coordinate.y][item.coordinate.x] ||
                this._isNear(item, this.game.powerItems) ||
                this.game.map.respawnPoints.some(a => a.x === item.coordinate.x && a.y === item.coordinate.y));
            this.game.powerItems.push(item);
            ++this.game.remainingItemSize;
        });

        // init types of each power item
        this.game.powerItems.forEach(item => item.type = PowerItem.TYPES.invincible);
        _.zip(_.sampleSize(this.game.powerItems, 2), [PowerItem.TYPES.bomb, PowerItem.TYPES.slow]).forEach(([item, type]) => {
            item.type = type;
        });

        // init normal items
        this.game.normalItems = [];
        _.times(this.game.map.height, y => {
            _.times(this.game.map.width, x => {
                if (!this.game.map.tiles[y][x] &&
                    !this.game.powerItems.some(a => a.coordinate.x === x && a.coordinate.y === y) &&
                    !_.isEqual({x, y}, this.game.players.find(a => !a.isEnemy).coordinate)) {
                    const normalItem = new NormalItem({x, y});
                    this.game.normalItems.push(normalItem);
                    ++this.game.remainingItemSize;
                }
            });
        });

        // update coordinate with pixel
        _.concat(this.game.players, this.game.normalItems, this.game.powerItems).forEach(a => {
            a.coordinate.x = a.coordinate.x * this.pixel + config.gameOffSetX;
            a.coordinate.y = a.coordinate.y * this.pixel + config.gameOffSetY;
        });
    }

    startGame () {
        if (this.game.state !== Game.STATES.init) {
            throw new Error(`cannot start game on ${this.game.state}`);
        }

        this.game.state = Game.STATES.running;
        this.game.startedAt = new Date();

        const tid = setTimeout(() => {
            if (this.game.state === Game.STATES.running) {
                this.game.remainingTime = 0;
                this.endGame({isTimeLimit: true});
            }
        }, config.gameTimeLimit);
        this.timeoutIds.push(tid);

        const scoreIntervalId = setInterval(() => {
            if (this.game.state !== Game.STATES.running) {
                clearInterval(scoreIntervalId);
                return;
            }

            this.game.remainingTime = Math.max(0, this.game.remainingTime - 100);
            this.game.updateScore();

            this.emit('updateScore', {
                score: this.game.score,
                remainingTime: this.game.remainingTime,
                killCount: this.game.killCount,
                takeNormalItemCount: this.game.takeNormalItemCount,
                takePowerItemCount: this.game.takePowerItemCount,
                takeInvincibleItemCount: this.game.takeInvincibleItemCount,
                takeBombItemCount: this.game.takeBombItemCount,
                takeSlowItemCount: this.game.takeSlowItemCount
            });
        }, 100);
        this.intervalIds.push(scoreIntervalId);

        this.game.updateScore();

        this.game.players.forEach(player => {
            if (player.isAI) {
                const ai = new EnemyAI1(player.id, this.game.map);
                this.aiLoopStart(player.id, ai);
            }
        });
    }

    endGame ({isTimeLimit = false} = {}) {
        if (this.game.state !== Game.STATES.running) {
            throw new Error(`cannot end game on ${this.game.state}`);
        }

        this.game.state = Game.STATES.ended;
        this.game.updateScore();

        this.game.logging();

        this.emit('endGame', {game: this.game, isTimeLimit});
    }

    aiLoopStart (aiId, ai, duration = config.defaultAIDuration) {
        const that = this;

        const aiLoopIntervalId = setInterval(() => {
            if (that.game.state !== Game.STATES.running) {
                clearInterval(aiLoopIntervalId);
                return;
            }

            try {
                const aiPlayer = that.game.players.find(x => x.id === aiId);
                const sheep = that.game.players.find(x => !x.isEnemy);
                if (aiPlayer.isAlive && sheep.isAlive) {
                    const players = that.game.players.map(player => ({
                        id: player.id,
                        isEnemy: player.isEnemy,
                        x: Math.floor((player.coordinate.x - config.gameOffSetX) / that.pixel),
                        y: Math.floor((player.coordinate.y - config.gameOffSetY) / that.pixel),
                        isInvincible: player.isInvincible
                    }));

                    const {x, y} = ai.nextMove(players);
                    aiPlayer.coordinate.x = x * that.pixel + config.gameOffSetX;
                    aiPlayer.coordinate.y = y * that.pixel + config.gameOffSetY;

                    that.emit('moveAI', {aiPlayer});
                }
            } catch (e) {
                console.error(e);
            }
        }, duration);
        this.intervalIds.push(aiLoopIntervalId);
    }

    movePlayer (user, {x, y}) {
        if (this.game.state !== Game.STATES.running) { return; }

        const player = this.game.players.find(x => x.user === user);
        if (!player) {
            throw new Error(`user ${user && user.username} was not found`);
        }

        if (player.isAlive) {
            player.coordinate.x = x;
            player.coordinate.y = y;
        }

        return player;
    }

    killSheep () {
        if (this.game.state !== Game.STATES.running) { return; }

        const sheep = this.game.players.find(x => !x.isEnemy);

        if (sheep.isAlive) {
            sheep.isAlive = false;
        }

        this.endGame();

        return sheep;
    }

    killWolf (wolfId) {
        if (this.game.state !== Game.STATES.running) { return; }

        const wolf = this.game.players.find(x => x.id === wolfId);
        if (!wolf) {
            throw new Error(`user ${wolfId} was not found`);
        }

        if (wolf.isAlive) {
            wolf.isAlive = false;

            ++this.game.killCount;

            const tid = setTimeout(() => {
                this.respawnWolf(wolfId);
            }, config.respawnDuration + Math.random() * config.respawnDurationAlpha);
            this.timeoutIds.push(tid);
        }

        return wolf;
    }

    respawnWolf (wolfId) {
        if (this.game.state !== Game.STATES.running) { return; }

        const wolf = this.game.players.find(x => x.id === wolfId);
        if (!wolf) {
            throw new Error(`user ${wolfId} was not found`);
        }

        wolf.coordinate = this._decideRespawnCoordinate();
        wolf.isAlive = true;

        this.emit('respawnWolf', {wolf});
    }

    _decideRespawnCoordinate () {
        let {x, y} = this.game.map.respawnPoints[0];
        let dist = this._calcDistanceFromAllAlive(this.game.map.respawnPoints[0]);

        this.game.map.respawnPoints.forEach(point => {
            const ndist = this._calcDistanceFromAllAlive(point);
            if (ndist > dist) {
                ([dist, x, y] = [ndist, point.x, point.y]);
            }
        });

        return {
            x: x * this.pixel + config.gameOffSetX,
            y: y * this.pixel + config.gameOffSetY
        };
    }

    _calcDistanceFromAllAlive ({x, y}) {
        let distSum = 0;

        this.game.players.forEach(a => {
            if (!a.isAlive) { return; }

            const ax = Math.floor((a.coordinate.x - config.gameOffSetX) / this.pixel);
            const ay = Math.floor((a.coordinate.y - config.gameOffSetY) / this.pixel);

            const k = a.isEnemy ? 1 : 2;

            distSum += (Math.abs(ax - x) + Math.abs(ay - y)) * k;
        });

        return distSum;
    }

    takeNormalItem (itemId) {
        if (this.game.state !== Game.STATES.running) { return; }

        const item = this.game.normalItems.find(x => x.id === itemId);
        if (!itemId) {
            throw new Error(`item of ${itemId} was not found`);
        }

        if (item.enabled) {
            item.enabled = false;
            ++this.game.takeNormalItemCount;

            --this.game.remainingItemSize;
            if (!this.game.remainingItemSize) {
                this.endGame();
            }
        }

        return item;
    }

    takePowerItem (itemId) {
        if (this.game.state !== Game.STATES.running) { return; }

        const item = this.game.powerItems.find(x => x.id === itemId);
        if (!itemId) {
            throw new Error(`item of ${itemId} was not found`);
        }

        if (item.enabled) {
            item.enabled = false;

            if (item.type === PowerItem.TYPES.invincible) {
                this._takeInvincibleItem();
            } else if (item.type === PowerItem.TYPES.bomb) {
                this._takeBombItem();
            } else if (item.type === PowerItem.TYPES.slow) {
                this._takeSlowItem();
            }

            --this.game.remainingItemSize;
            if (!this.game.remainingItemSize) {
                this.endGame();
            }
        }

        return item;
    }

    _takeInvincibleItem () {
    	++this.game.takeInvincibleItemCount;
        if (this.invincibleTimeoutId) {
            clearTimeout(this.invincibleTimeoutId);
        }

        const sheep = this.game.players.find(x => !x.isEnemy);

        sheep.isInvincible = true;
        this.emit('startInvincible', {});

        this.invincibleTimeoutId = setTimeout(() => {
            if (this.game.state === Game.STATES.running) {
                sheep.isInvincible = false;
                this.emit('endInvincible', {});
            }
        }, config.powerDuration);
        this.timeoutIds.push(this.invincibleTimeoutId);
    }

    _takeBombItem () {
    	++this.game.takeBombItemCount;
        this.emit('bomb', {});
        this.game.players
            .filter(player => player.isEnemy)
            .forEach(player => this.killWolf(player.id));
    }

    _takeSlowItem () {
    	++this.game.takeSlowItemCount;
        this.emit('startSlow', {});

        const slowTimeoutId = setTimeout(() => {
            if (this.game.state === Game.STATES.running) {
                this.emit('endSlow', {});
            }
        }, config.slowDuration);
        this.timeoutIds.push(slowTimeoutId)
    }

    _isNear (target, others) {
        return others.some(a => {
            const xx = Math.abs(a.coordinate.x - target.coordinate.x);
            const yy = Math.abs(a.coordinate.y - target.coordinate.y);
            const dist = xx + yy;
            return dist <= config.nearPowerItemDistance;
        });
    }
}

module.exports = GameMaster;
