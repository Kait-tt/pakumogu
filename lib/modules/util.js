'use strict';
const _  = require('lodash');

const ID_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

class Util {
    static generateId (size = 12) {
        return _.range(size).map(() => _.sample(ID_CHARS)).join('');
    }
}

module.exports = Util;
