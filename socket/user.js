class SocketUser {
    constructor (socket) {
        this.socket = socket;
        this.username = null;
        this.id = this.socket.id;
        this.active = true;
    }
}

module.exports = SocketUser;
