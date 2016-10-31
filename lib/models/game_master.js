'use strict';
const _ = require('lodash');
const Game = require('./game');
const Player = require('./player');

const PLAYER_SIZE = 5;

class GameMaster {
    constructor () {
        this.game = null;
    }

    createGame () {
        this.game = new Game();
    }

    addPlayer (playerOptions = {}) {
        if (this.game.state !== Game.STATES.idle) {
            throw new Error('cannot add game player after init game');
        }

        if (this.game.players.size >= PLAYER_SIZE) {
            throw new Error(`cannot add over ${PLAYER_SIZE} players`);
        }

        const player = new Player(playerOptions);
        this.game.players.push();
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

        // TODO: init power food

        // TODO: init each coordinate
    }
}

module.exports = GameMaster;
