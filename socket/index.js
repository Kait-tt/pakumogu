const socketio = require('socket.io');
const SocketUser = require('./user');

class SocketRouter {
    static get gameRoomKey () {
        return '__game_room';
    }

    constructor (server) {
        this.io = socketio.listen(server);
        this.users = {};

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
            });

            socket.on('disconnect', () => {
                console.log(`disconnect: ${socket.id} , ${user.username}`);
                this.leaveRoom(user);
                user.active = false;
                delete this.users[socket.id];
            });
        });
    }

    emits (key, params) {
        this.io.to(this.gameRoomKey).emit(key, params);
    }

    joinRoom (user) {
        user.socket.join(this.gameRoomKey);
    }

    leaveRoom (user) {
        user.username = null;
        user.socket.leave(this.gameRoomKey);
    }
}

module.exports = SocketRouter;
