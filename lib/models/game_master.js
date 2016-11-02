'use strict';
const _ = require('lodash');
const EventEmitter2 = require('eventemitter2');
const Game = require('./game');
const Player = require('./player');
const Map = require('./map');
const NormalItem = require('./normalItem');
const EnemyAI1 = require('./enemy_ai1');

const PLAYER_SIZE = 5;
const DEFAULT_AI_DURATION = 500;

class GameMaster extends EventEmitter2 {
    constructor (pixel = 64) {
        super({});
        this.game = null;
        this.pixel = pixel;
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

        // init normal items
        this.game.normalItems = [];
        _.times(this.game.map.height, y => {
            _.times(this.game.map.width, x => {
                const normalItem = new NormalItem({x, y});
                this.game.normalItems.push(normalItem);
            });
        });

        // TODO: init power food

        // init coordinate of each players
        _.sampleSize(this.game.map.respawnPoints, PLAYER_SIZE).forEach(({x, y}, idx) => {
            this.game.players[idx].coordinate.x = x * this.pixel;
            this.game.players[idx].coordinate.y = y * this.pixel;
        });
    }

    startGame () {
        if (this.game.state !== Game.STATES.init) {
            throw new Error(`cannot start game on ${this.game.state}`);
        }

        this.game.state = Game.STATES.running;
        this.game.startedAt = new Date();

        this.game.players.forEach(player => {
            if (player.isAI) {
                const ai = new EnemyAI1(player.id, this.game.map.tiles);
                this.aiLoopStart(player.id, ai);
            }
        });
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
                        x: Math.floor(player.coordinate.x / that.pixel),
                        y: Math.floor(player.coordinate.y / that.pixel)
                    }));

                    const {x, y} = ai.nextMove(players);
                    aiPlayer.coordinate.x = x * that.pixel;
                    aiPlayer.coordinate.y = y * that.pixel;

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
        return sheep;
    }
}

module.exports = GameMaster;
