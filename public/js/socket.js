(function () {
    'use strict';

    class Socket {
        constructor () {
            this.io = io.connect();
        }

        on (name, callback) {
            this.io.on(name, callback);
        }

        emit (name, params) {
            this.io.emit(name, params);
        }

        initGame () {
            this.io.emit('initGame');
        }

        startGame () {
            this.io.emit('startGame');
        }

        movePlayer ({x, y}) {
            this.io.emit('movePlayer', {x, y});
        }

        killSheep () {
            this.io.emit('killSheep', {});
        }

        killWolf ({wolfId}) {
            this.io.emit('killWolf', {wolfId});
        }

        takeNormalItem ({itemId}) {
            this.io.emit('takeNormalItem', {itemId})
        }

        takePowerItem ({itemId}) {
            this.io.emit('takePowerItem', {itemId});
        }

        join (username) {
            this.username = username;
            this.io.emit('joinRoom', {username});
        }

        leave () {
            this.io.emit('leaveRoom', {});
        }
    }

    window.Socket = Socket;
}());
