

//////////// INITIALIZATION /////////
var express = require('express');

var app = express();
app.set('port',process.env.PORT || 3000);

var handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        section: function(name, options) {
            if(!this._sections) this._sections={};
            this._sections[name]=options.fn(this);
            return null;
        },
        urlEncode: function(string) {
            return encodeURIComponent(string);
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine','handlebars');

var session = require('express-session');

var passport = require('passport')
    , ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
    , passport_discord = require('passport-discord');

var scopes = ['identify'];

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });
  
// var redirect = encodeURIComponent('http://localhost:3000/callback');
passport.use(new passport_discord({
    clientID: '415537639039696896',
    clientSecret: 'fnFfkWkkKyJap-NpsPWViK-6BzNyH9o6',
    callbackURL: '/levelSelect',
    scope: scopes
},
function(accessToken, refreshToken, profile, cb){
    if(err){
        return done(err);
    }
    User.findOrCreate({discordId: profile.id},function(err, user){
        return cb(err, user);
    });
}));

///////// PIPELINE /////////////

// For any URL that matches the path of a file within the specified folder,
// static will server that file. Otherwise, it will continue to the next
// item in the pipeline.
// Mark the static directory as a "Resource Route" in Webstorm and it will know
// that files can be found there and warn you when not found.
app.use(express.static(__dirname+'/static'));

app.use(session(require('./config/express-session-options')));

app.use(passport.initialize()); 
app.use(passport.session());

app.use(require('body-parser').urlencoded({extended: true}));

app.get('/', function(req, res, next){
    res.render('home');
});

app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/levelSelect') } // auth success
);

app.get('/levelSelect', checkAuth, function(req, res, next){
    passport.authenticate('discord', { failureRedirect: '/login' }), function(req, res) { res.redirect('/levelSelect') } // auth success
});

app.get('/login', passport.authenticate('discord', {
    scope: scopes }), function(req, res) {});

// var discord_auth = require('./api/discord_auth');
// app.use('/api/discord_auth', discord_auth);

var levelSelectRouter = require('./route/levelSelect');
levelSelectRouter.handlebars = handlebars;
levelSelectRouter.passport = passport;

app.use('/levelSelect', ensureLoggedIn('/login'), levelSelectRouter);

/////// ERROR HANDLING

/**
 * This app.use catches any unknown URLs, giving a 404
 * A URL is unknown if it doesn't match anything we
 * specified previously.
 */
app.use(function (req, res) {
    //res.type('text/plain');
    res.status(404);
    res.render('404');
});

/**
 * An app.use callback with FOUR (4) parameters is an
 * error handler; the err is in the first
 * parameter to the function.
 * This lets you gracefully catch errors in your
 * code without crashing your whole application
 */
app.use(function (err, req, res, next) {
    console.log(err.stack);
    //res.type('text/plain');
    res.status(500); // server error
    res.render("500");
});

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send('not logged in :(');
}


////////// STARTUP

app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port')+ "; press Ctrl+C to end.");
});
