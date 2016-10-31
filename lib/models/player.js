'use strict';

class Player {
    constructor ({isEnemy = true, isAI = true, isAlive = true, user = null} = {}) {
        this.coordinate = {x: 0, y: 0};
        this.isEnemy = isEnemy;
        this.isAI = isAI;
        this.isAlive = isAlive;
        this.user = user;
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
            } : null
        }
    }
}

module.exports = Player;
