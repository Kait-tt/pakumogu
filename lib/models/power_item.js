'use strict';
const Util = require('../modules/util');

class PowerItem {
    constructor ({x, y, enabled = true}) {
        this.id = Util.generateId();
        this.coordinate = {x, y};
        this.enabled = enabled;
        this.type = null;
    }

    static get TYPES () {
        return {
            invincible: 'invincible',
            bomb: 'bomb',
            slow: 'slow'
        }
    }
}

module.exports = PowerItem;
