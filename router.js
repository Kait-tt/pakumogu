'use strict';
const express = require('express');
const Controller = require('./lib/controllers/');
const addon = require('./addons');

class Router extends express.Router {
    constructor (passport, options) {
        addon.callAddons('Router', 'setRouter', {parentRouter: this}, {sync: true});

        this.all('/api/*', Controller.Api.notFound);
        this.all('*', Controller.Index.notFound);
        this.use(Controller.Index.internalServerError);
    }
}

module.exports = Router;
