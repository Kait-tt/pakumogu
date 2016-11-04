'use strict';
const socketio = require('socket.io');
const SocketUser = require('./user');
const Game = require('../lib/models/game');
const GameMaster = require('../lib/models/game_master');

class SocketRouter {
    static get gameRoomKey () {
        return '__game_room';
    }

    constructor (server) {
        this.io = socketio.listen(server);
        this.users = {};
        this.gameMaster = new GameMaster();

        this.gameMaster.createGame();

        this.gameMaster.on('moveAI', ({aiPlayer}) => {
            this.emits('movePlayer', {player: aiPlayer.serialize()});
        });

        this.gameMaster.on('respawnWolf', ({wolf}) => {
            this.emits('respawnWolf', {player: wolf.serialize()});
        });

        this.gameMaster.on('startInvincible', () => {
            this.emits('startInvincible', {});
        });

        this.gameMaster.on('endInvincible', () => {
            this.emits('endInvincible', {});
        });

        this.gameMaster.on('bomb', () => {
            this.emits('bomb', {});
        });

        this.gameMaster.on('startSlow', () => {
            this.emits('startSlow', {});
        });

        this.gameMaster.on('endSlow', () => {
            this.emits('endSlow', {});
        });

        this.gameMaster.on('endGame', ({game, isTimeLimit}) => {
            this.emits('endGame', {game: game.serialize(), isTimeLimit});
            this.gameMaster.reCreateGame();
        });

        this.gameMaster.on('updateScore', (scores) => {
            this.emits('updateScore', scores);
        });

        this.io.sockets.on('connection', socket => {
            const user = new SocketUser(socket);

            this.users[socket.id] = user;
            console.log(`new connected: ${socket.id} , ${user.username}`);

            socket.on('joinRoom', ({username}) => {
                user.username = username;
                this.joinRoom(user);
            });

            socket.on('leaveRoom', () => {
                this.leaveRoom(user);
                user.username = null;
            });

            socket.on('disconnect', () => {
                console.log(`disconnect: ${socket.id} , ${user.username}`);
                this.leaveRoom(user);
                user.active = false;
                delete this.users[socket.id];
            });

            socket.on('initGame', () => {
                this.initGame(user);
            });

            socket.on('startGame', () => {
                this.startGame(user);
            });

            socket.on('movePlayer', ({x, y}) => {
                this.movePlayer(user, {x, y});
            });

            socket.on('killSheep', () => {
                this.killSheep(user);
            });

            socket.on('killWolf', ({wolfId}) => {
                this.killWolf(user, wolfId);
            });

            socket.on('takeNormalItem', ({itemId}) => {
                this.takeNormalItem(user, itemId);
            });

            socket.on('takePowerItem', ({itemId}) => {
                this.takePowerItem(user, itemId);
            });
        });
    }

    joinRoom (user) {
        if (this.gameMaster.game.state !== Game.STATES.idle) { return; }
        if (this.gameMaster.game.players.length >= 5) {
            console.error('cannot join game joined 5 players');
            return;
        }

        user.socket.join(this.gameRoomKey);

        try {
            this.gameMaster.addPlayer(user);
            this.emits('joinRoom', {username: user.username, id: user.id, game: this.gameMaster.game.serialize()});
            user.socket.emit('yourInfo', {username: user.username, id: user.id});
        } catch (e) {
            console.error(e);
            user.socket.emit('operationError', {error: e, message: e.message});
        }
    }

    leaveRoom (user) {
        try {
            this.gameMaster.removePlayer(user);
            this.emits('leaveRoom', {username: user.username, id: user.id, game: this.gameMaster.game.serialize()});
            user.socket.leave(this.gameRoomKey);
            if (!this.gameMaster.game.players.filter(x => !x.isAI).length) {
                this.gameMaster.reCreateGame();
            }
        } catch (e) {
            console.error(e);
            user.socket.emit('operationError', {error: e, message: e.message});
        }
    }

    initGame (user) {
        try {
            this.gameMaster.initGame();
            this.emits('initGame', {game: this.gameMaster.game.serialize()});
        } catch (e) {
            console.error(e);
            user.socket.emit('operationError', {error: e, message: e.message});
        }
    }

    startGame (user) {
        try {
            this.gameMaster.startGame();
            this.emits('startGame', {game: this.gameMaster.game.serialize()});
        } catch (e) {
            console.error(e);
            user.socket.emit('operationError', {error: e, message: e.message});
        }
    }

    movePlayer (user, {x, y}) {
        if (this.gameMaster.game.state !== Game.STATES.running) { return; }

        try {
            const player = this.gameMaster.movePlayer(user, {x, y});
            if (!player.isAlive) { return; }
            this.emits('movePlayer', {player: player.serialize()});
        } catch (e) {
            console.error(e);
            user.socket.emit('operationError', {error: e, message: e.message});
        }
    }

    killSheep (user) {
        if (this.gameMaster.game.state !== Game.STATES.running) { return; }

        const sheep = this.gameMaster.game.players.find(x => !x.isEnemy);
        if (!sheep.isAlive) { return; }

        try {
            this.gameMaster.killSheep();
            this.emits('killSheep', {});
        } catch (e) {
            console.error(e);
            user.socket.emit('operationError', {error: e, message: e.message});
        }
    }

    killWolf (user, wolfId) {
        if (this.gameMaster.game.state !== Game.STATES.running) { return; }

        const wolf = this.gameMaster.game.players.find(x => x.id === wolfId);
        if (!wolf.isAlive) { return; }

        try {
            const wolf = this.gameMaster.killWolf(wolfId);
            this.emits('killWolf', {player: wolf.serialize()});
        } catch (e) {
            console.error(e);
            user.socket.emit('operationError', {error: e, message: e.message});
        }
    }

    takeNormalItem (user, itemId) {
        if (this.gameMaster.game.state !== Game.STATES.running) { return; }

        let item = this.gameMaster.game.normalItems.find(x => x.id === itemId);
        if (!item.enabled) { return; }

        try {
            item = this.gameMaster.takeNormalItem(itemId);
            this.emits('takeNormalItem', {normalItem: item});
        } catch (e) {
            console.error(e);
            user.socket.emit('operationError', {error: e, message: e.message});
        }
    }

    takePowerItem (user, itemId) {
        if (this.gameMaster.game.state !== Game.STATES.running) { return; }

        let item = this.gameMaster.game.powerItems.find(x => x.id === itemId);
        if (!item.enabled) { return; }

        try {
            item = this.gameMaster.takePowerItem(itemId);
            this.emits('takePowerItem', {powerItem: item});
        } catch (e) {
            console.error(e);
            user.socket.emit('operationError', {error: e, message: e.message});
        }
    }

    emits (key, params) {
        this.io.to(this.gameRoomKey).emit(key, params);
    }
}

module.exports = SocketRouter;
