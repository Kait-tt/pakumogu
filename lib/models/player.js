'use strict';

class Player {
    constructor ({isEnemy = true, isAI = true, isAlive = true, userId = null} = {}) {
        this.coordinate = {x: 0, y: 0};
        this.isEnemy = isEnemy;
        this.isAI = isAI;
        this.isAlive = isAlive;
        this.userId = userId;
    }
}

module.exports = Player;
