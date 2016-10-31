'use strict';

class Player {
    constructor ({isEnemy = true, isAI = true, isAlive = true, user = null} = {}) {
        this.coordinate = {x: 0, y: 0};
        this.isEnemy = isEnemy;
        this.isAI = isAI;
        this.isAlive = isAlive;
        this.user = user;
    }
}

module.exports = Player;
