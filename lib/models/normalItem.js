'use strict';

class NormalItem {
    constructor ({x, y, enabled = true}) {
        this.x = x;
        this.y = y;
        this.enabled = enabled;
    }
}

module.exports = NormalItem;
