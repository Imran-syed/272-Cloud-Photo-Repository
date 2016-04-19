var express = require('express');
var bodyParser =  require("body-parser");
var mongoose    = require('mongoose');
var config      = require(__dirname +'/backend/config/mongoConnect');
var signup = require(__dirname +'/backend/routes/user');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(config.database);

//views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
   response.render('index',{error:false});
});
app.get('/user', signup.getUser);

app.post('/signup', signup.createUser);

var user = require(__dirname +'/backend/routes/user')(app);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

