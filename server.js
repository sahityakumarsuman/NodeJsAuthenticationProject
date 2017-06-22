var express = require('express');
var app = express();
var body_parser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

var config = require('./config');
var user = require('./models/user');


var portNo = process.env.PORT || 8080;

mongoose.connect(config.database);
app.set('superSecret',config.secret);

app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());

app.use(morgan('dev'));


app.get('/', function(req, res) {
    res.send('Hello! The API is at http://127.0.0.1:' + portNo + '/api');
});

app.listen(portNo);
console.log('Magic happens at http://127.0.0.1:' + portNo);