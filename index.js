

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

var session=require('express-session');

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

passport.use(new LocalStrategy(
    function(username,password,done) {
        // username and password are strings entered by the user
        // done is a function to all with the first parameter an error
        // object or null if no error; the second parameter is false if
        // login failed or an object representing the user.
        console.log("Attempting local login for "+username);
        if(password==="password") {
            return done(null, {name: username});// why, yes... "password" is my password; I'm an idiot!
        }
        else {
            return done(null, false);//not logged in
        }
    }
));

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

app.use('/levelSelect', ensureLoggedIn('/login'));

app.get('/', function(req, res, next){
    res.render('home');
});

app.get('/levelSelect', function(req, res, next){
    res.render('levelSelect');
});

app.get('/login', function(req, res, next){
    res.render('login');
});

var levelSelectRouter = require('./route/levelSelect');
levelSelectRouter.handlebars = handlebars;
levelSelectRouter.passport = passport;
app.use('/levelSelect', levelSelectRouter);

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


////////// STARTUP

app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port')+ "; press Ctrl+C to end.");
});
