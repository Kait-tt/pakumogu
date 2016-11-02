'use strict';
const socketio = require('socket.io');
const SocketUser = require('./user');
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
        });
    }

    joinRoom (user) {
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
        this.emits('leaveRoom', {username: user.username, id: user.id});
        try {
            this.gameMaster.removePlayer(user);
            user.socket.leave(this.gameRoomKey);
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
        try {
            const player = this.gameMaster.movePlayer(user, {x, y});
            this.emits('movePlayer', {player: player.serialize()});
        } catch (e) {
            console.error(e);
            user.socket.emit('operationError', {error: e, message: e.message});
        }
    }

    killSheep (user) {
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

    emits (key, params) {
        this.io.to(this.gameRoomKey).emit(key, params);
    }
}

module.exports = SocketRouter;
