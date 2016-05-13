var express = require('express');
var app = express();
var bodyParser =  require("body-parser");
var mongoose    = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
multer = require('multer');

deviceName = 'Choose Device';
//var mongodbURI  = 'mongodb://52.200.26.204:27017/cmpe272';
//console.log(mongodbURI);
var config      = require(__dirname +'/config/mongoConnect');
app.use(express.static(__dirname + '/static'));

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

//mongoose.connect(mongodbURI);
mongoose.connect(config.database);
require('./config/passport')(passport);

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(session({ secret: config.secret })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./app/routes.js')(app, passport);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

