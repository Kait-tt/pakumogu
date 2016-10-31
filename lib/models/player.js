'use strict';

class Player {
    constructor ({isEnemy = true, isAI = true, isAlive = true} = {}) {
        this.coordinate = {x: 0, y: 0};
        this.isEnemy = isEnemy;
        this.isAI = isAI;
        this.isAlive = isAlive;
    }
}

module.exports = Player;
