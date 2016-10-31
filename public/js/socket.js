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

        movePlayer (x, y) {
            this.io.emit('movePlayer', {x, y});
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
