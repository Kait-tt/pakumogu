'use strict';
const Util = require('../modules/util');

class Player {
    constructor ({isEnemy = true, isAI = true, isAlive = true, user = null} = {}) {
        this.coordinate = {x: 0, y: 0};
        this.isEnemy = isEnemy;
        this.isAI = isAI;
        this.isAlive = isAlive;
        this.user = user;
        this.id = user ? user.id : Util.generateId();
    }

    serialize () {
        return {
            coordinate: this.coordinate,
            isEnemy: this.isEnemy,
            isAI: this.isAI,
            isAlive: this.isAlive,
            user: this.user ? {
                username: this.user.username,
                id: this.user.id
            } : null,
            id: this.id
        }
    }
}

module.exports = Player;
