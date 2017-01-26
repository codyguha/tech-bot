var express = require('express')

// Create a new Express application.
var app = express()
var http = require('http').Server(app)

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
var bodyParser = require('body-parser')
var path = require('path')
app.use(express.static(path.join(__dirname, '/public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Configure view engine to render EJS templates.
app.set('view engine', 'ejs')
require('./app/routes/routes')(app)

var request = require('request');

app.set('port', (process.env.PORT || 5000))

http.listen(app.get('port'), function () {
  console.log('listening on port ' + app.get('port'))
})
