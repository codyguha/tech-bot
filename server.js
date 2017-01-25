var express = require('express')
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'https://lit-thicket-26597.herokuapp.com/login/facebook/return',
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

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

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

var request = require('request');

function getPages(id, cb) {
    if (!cb) cb = Function.prototype
    request({
      method: 'GET',
      uri: `https://graph.facebook.com/v2.8/${id}/accounts`,
      qs: {
        fields: 'name',
        access_token: process.env.page_token
      },
      json: true
    }, function(err, res, body) {
      if (err) return cb(err)
      if (body.error) return cb(body.error)
      console.log(body)
      cb(null, body)
    })
}
// Define routes.
app.get('/',
  function(req, res) {
    getPages( req.user.id ,function(err, pages) {
      var page_list = ""
      var array = pages.data
      for(var i = 0; i < array.length; i++) {
          console.log(">>>>>>>>>>>>>>>>>>>>" + array[i].name)
          page_list += "'" + array[i].name + "', "
      }
      console.log(">>>>>>>>>>>>>>>>PAGES!!!!" + page_list)
      res.render('profile', { user: req.user, pages: page_list.slice(0, -2) });
    });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/facebook',
  passport.authenticate('facebook', { scope: ['user_friends', 'manage_pages'] }));

app.get('/login/facebook/return',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.set('port', (process.env.PORT || 5000))

http.listen(app.get('port'), function () {
  console.log('listening on port ' + app.get('port'))
})
