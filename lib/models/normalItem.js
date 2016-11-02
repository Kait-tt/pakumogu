'use strict';
const Util = require('../modules/util');

class NormalItem {
    constructor ({x, y, enabled = true}) {
        this.id = Util.generateId();
        this.coordinate = {x, y};
        this.enabled = enabled;
    }
}

module.exports = NormalItem;
