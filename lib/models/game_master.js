'use strict';
const _ = require('lodash');
const EventEmitter2 = require('eventemitter2');
const Game = require('./game');
const Player = require('./player');
const Map = require('./map');
const NormalItem = require('./normal_item');
const PowerItem = require('./power_item');
const EnemyAI1 = require('./enemy_ai1');

const PLAYER_SIZE = 5;
const DEFAULT_AI_DURATION = 800; // sec
const DEFAULT_POWER_ITEM_SIZE = 5; // number of power items
const NEAR_POWER_ITEM_DISTANCE = 6;
const POWER_DURATION = 5000; // sec

// actual respawn time = RESPAWN_DURATION + Math.random() * RESPAWN_DURATION_ALPHA
const RESPAWN_DURATION = 4000; // sec
const RESPAWN_DURATION_ALPHA = 2000; // sec

const GAME_TIME_LIMIT = 30000; // sec

const gameOffSetX = 480;
const gameOffSetY = 40;

class GameMaster extends EventEmitter2 {
    constructor (pixel = 64) {
        super({});
        this.game = null;

        this.pixel = pixel;
        this.invincibleTimeoutId = null;
    }

    createGame () {
        this.game = new Game();
        return this.game;
    }

    addPlayer (user) {
        if (this.game.state !== Game.STATES.idle) {
            throw new Error('cannot add game player after init game');
        }

        if (this.game.players.size >= PLAYER_SIZE) {
            throw new Error(`cannot add over ${PLAYER_SIZE} players`);
        }

        const player = new Player({user, isAI: false});
        this.game.players.push(player);
    }

    removePlayer (user) {
        if (this.game.state !== Game.STATES.idle) {
            // throw new Error('cannot remove game player after init game');
            // TODO: change to AI
        }

        _.remove(this.game.players, player => player.user === user);
    }

    initGame () {
        if (this.game.state !== Game.STATES.idle) {
            throw new Error('cannot add game player after start game');
        }
        this.game.state = Game.STATES.init;

        const users = this.game.players.filter(x => !x.isAI);
        if (!users.length) {
            throw new Error('cannot start game joined no user');
        }

        // decide packman
        const packman = _.sample(users);
        this.game.players.forEach(player => {
            player.isEnemy = player !== packman;
        });

        // add AI
        while (this.game.players.length < PLAYER_SIZE) {
            const player = new Player({isEnemy: true, isAI: true});
            this.game.players.push(player);
        }

        // decide map
        this.game.map = new Map();

        // init power item
        this.game.powerItems = [];
        _.times(DEFAULT_POWER_ITEM_SIZE, () => {
            const item = new PowerItem({x: 0, y: 0});
            do {
                item.coordinate.x = _.random(this.game.map.width - 1);
                item.coordinate.y = _.random(this.game.map.height - 1);
            } while (this.game.map.tiles[item.coordinate.y][item.coordinate.x] ||
                this._isNear(item, this.game.powerItems));
            this.game.powerItems.push(item);
            ++this.game.remainingItemSize;
        });

        // init normal items
        this.game.normalItems = [];
        _.times(this.game.map.height, y => {
            _.times(this.game.map.width, x => {
                if (!this.game.map.tiles[y][x] &&
                    !this.game.powerItems.some(a => a.coordinate.x === x && a.coordinate.y === y)) {
                    const normalItem = new NormalItem({x, y});
                    this.game.normalItems.push(normalItem);
                    ++this.game.remainingItemSize;
                }
            });
        });

        // TODO: init power food

        // init coordinate of each players
        _.sampleSize(this.game.map.respawnPoints, PLAYER_SIZE).forEach(({x, y}, idx) => {
            this.game.players[idx].coordinate.x = x;
            this.game.players[idx].coordinate.y = y;
        });

        // update coordinate with pixel
        _.concat(this.game.players, this.game.normalItems, this.game.powerItems).forEach(a => {
            a.coordinate.x = a.coordinate.x * this.pixel + gameOffSetX;
            a.coordinate.y = a.coordinate.y * this.pixel + gameOffSetY;
        });
    }

    startGame () {
        if (this.game.state !== Game.STATES.init) {
            throw new Error(`cannot start game on ${this.game.state}`);
        }

        this.game.timeLimit = GAME_TIME_LIMIT;

        this.game.state = Game.STATES.running;
        this.game.startedAt = new Date();

        setTimeout(() => {
            if (this.game.state === Game.STATES.running) {
                this.endGame({isTimeLimit: true});
            }
        }, GAME_TIME_LIMIT);

        this.game.players.forEach(player => {
            if (player.isAI) {
                const ai = new EnemyAI1(player.id, this.game.map.tiles);
                this.aiLoopStart(player.id, ai);
            }
        });
    }

    endGame ({isTimeLimit = false} = {}) {
        if (this.game.state !== Game.STATES.running) {
            throw new Error(`cannot end game on ${this.game.state}`);
        }

        this.game.state = Game.STATES.ended;

        this.emit('endGame', {game: this.game, isTimeLimit});
    }

    aiLoopStart (aiId, ai, duration = DEFAULT_AI_DURATION) {
        const that = this;

        setTimeout(aiLoop, duration);

        function aiLoop () {
            if (that.game.state !== Game.STATES.running) { return; }

            try {
                const aiPlayer = that.game.players.find(x => x.id === aiId);
                const sheep = that.game.players.find(x => !x.isEnemy);
                if (aiPlayer.isAlive && sheep.isAlive) {
                    const players = that.game.players.map(player => ({
                        id: player.id,
                        isEnemy: player.isEnemy,
                        x: Math.floor((player.coordinate.x - gameOffSetX) / that.pixel),
                        y: Math.floor((player.coordinate.y - gameOffSetY) / that.pixel)
                    }));

                    const {x, y} = ai.nextMove(players);
                    aiPlayer.coordinate.x = x * that.pixel + gameOffSetX;
                    aiPlayer.coordinate.y = y * that.pixel + gameOffSetY;

                    that.emit('moveAI', {aiPlayer});
                }
            } catch (e) {
                console.error(e);
            }

            setTimeout(aiLoop, duration);
        }
    }

    movePlayer (user, {x, y}) {
        const player = this.game.players.find(x => x.user === user);
        if (!player) {
            throw new Error(`user ${user && user.username} was not found`);
        }

        player.coordinate.x = x;
        player.coordinate.y = y;
        return player;
    }

    killSheep () {
        const sheep = this.game.players.find(x => !x.isEnemy);

        if (sheep.isAlive) {
            sheep.isAlive = false;
        }

        this.endGame();

        return sheep;
    }

    killWolf (wolfId) {
        const wolf = this.game.players.find(x => x.id === wolfId);
        if (!wolf) {
            throw new Error(`user ${wolfId} was not found`);
        }

        if (wolf.isAlive) {
            wolf.isAlive = false;

            setTimeout(() => {
                this.respawnWolf(wolfId);
            }, RESPAWN_DURATION + Math.random() * RESPAWN_DURATION_ALPHA);
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
            x: x * this.pixel + gameOffSetX,
            y: y * this.pixel + gameOffSetY
        };
    }

    _calcDistanceFromAllAlive ({x, y}) {
        let distSum = 0;

        this.game.players.forEach(a => {
            if (!a.isAlive) { return; }

            const ax = Math.floor((a.coordinate.x - gameOffSetX) / this.pixel);
            const ay = Math.floor((a.coordinate.y - gameOffSetY) / this.pixel);
            distSum += Math.abs(ax - x) + Math.abs(ay - y);
        });

        return distSum;
    }

    takeNormalItem (itemId) {
        const item = this.game.normalItems.find(x => x.id === itemId);
        if (!itemId) {
            throw new Error(`item of ${itemId} was not found`);
        }

        if (item.enabled) {
            item.enabled = false;

            --this.game.remainingItemSize;
            if (!this.game.remainingItemSize) {
                this.endGame();
            }
        }

        return item;
    }

    takePowerItem (itemId) {
        const item = this.game.powerItems.find(x => x.id === itemId);
        if (!itemId) {
            throw new Error(`item of ${itemId} was not found`);
        }

        if (item.enabled) {
            item.enabled = false;

            if (this.invincibleTimeoutId) {
                clearTimeout(this.invincibleTimeoutId);
            }

            --this.game.remainingItemSize;
            if (!this.game.remainingItemSize) {
                this.endGame();
            } else {
                this.emit('startInvincible', {});

                this.invincibleTimeoutId = setTimeout(() => {
                    if (this.game.state === Game.STATES.running) {
                        this.emit('endInvincible', {});
                    }
                }, POWER_DURATION);
            }
        }

        return item;
    }

    _isNear (target, others) {
        return others.some(a => {
            const xx = Math.abs(a.coordinate.x - target.coordinate.x);
            const yy = Math.abs(a.coordinate.y - target.coordinate.y);
            const dist = xx + yy;
            return dist <= NEAR_POWER_ITEM_DISTANCE;
        });
    }
}

module.exports = GameMaster;
