'use strict';
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

        // TODO:
        // TODO: decide packman
        // TODO: add ai
        // TODO: init power food
    }
}

module.exports = GameMaster;
