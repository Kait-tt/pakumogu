'use strict';
const _ = require('lodash');
const Game = require('./game');
const Player = require('./player');
const Map = require('./map');

const PLAYER_SIZE = 5;

class GameMaster {
    constructor () {
        this.game = null;
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
        while (this.game.players < PLAYER_SIZE) {
            const player = new Player({isEnemy: true, isAI: true});
            this.game.players.push(player);
        }

        // decide map
        this.game.map = new Map();

        // TODO: init power food

        // TODO: init each coordinate
    }

    startGame () {
        if (this.game.state !== Game.STATES.init) {
            throw new Error(`cannot start game on ${this.game.state}`);
        }

        this.game.state = Game.STATES.running;
        this.game.startedAt = new Date();
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
}

module.exports = GameMaster;
