const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(favicon(__dirname + '/public/favicon.ico'));
if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routing
const router = new express.Router();

router.get('/', (req, res) => {
    res.render('index', {});
});

router.all('*', (req, res) => {
    res.status(404);
    res.render('error', {
        message: 'Not Found',
        error: {}
    });
});

router.use((err, req, res, next) => {
    res.status(err.status || 500);
    if (err && (!err.status || Math.floor(err.status / 100) === 5)) {
        console.error(err);
    }

    res.render('error', {
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});

module.exports = app;
