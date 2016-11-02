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

            let joined = false;
            this.io.on('connect', () => {
                if (!joined) {
                    joined = true;
                    this.io.emit('joinRoom', {username});
                }
            });

            if (this.io.connected) {
                if (!joined) {
                    joined = true;
                    this.io.emit('joinRoom', {username});
                }
            }

            this.io.on('disconnect', () => {
                joined = false;
            });
        }
    }

    window.Socket = Socket;
}());
