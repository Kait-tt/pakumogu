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
                this.initGame();
            });

            socket.on('startGame', () => {
                this.startGame();
            });

            socket.on('movePlayer', ({x, y}) => {
                this.movePlayer(user, {x, y});
            });
        });
    }

    joinRoom (user) {
        user.socket.join(this.gameRoomKey);
        this.gameMaster.addPlayer(user);
        this.emits('joinRoom', {username: user.username, id: user.id});
    }

    leaveRoom (user) {
        this.emits('leaveRoom', {username: user.username, id: user.id});
        this.gameMaster.removePlayer(user);
        user.socket.leave(this.gameRoomKey);
    }

    initGame () {
        this.gameMaster.initGame();
        this.emits('initGame', {game: this.game});
    }

    startGame () {
        this.gameMaster.startGame();
        this.emits('startGame', {game: this.game});
    }

    movePlayer (user, {x, y}) {
        const player = this.gameMaster.movePlayer(user, {x, y});
        this.emits('movePlayer', {player});
    }

    emits (key, params) {
        this.io.to(this.gameRoomKey).emit(key, params);
    }
}

module.exports = SocketRouter;
