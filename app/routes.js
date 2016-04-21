module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page of our CPR(will also have our login links)
    app.get('/', function (req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user: req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
	
	//USER =================================
	app.get('/user', function (req, res) {
        res.render('user.ejs');
    });

    //USER HOME =============================
    app.get('/userhome', function (req, res) {
        res.render('userhome.ejs');
    });

    //USER PHOTOS============================
    app.get('/photos', function (req, res) {
        res.render('photos.ejs');
    });

    // =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================
    
    // LOGIN ===============================
    // show the login form
    app.get('/login', function (req, res) {
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/user',
        failureRedirect: '/login',
        failureFlash: true
    }));

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function (req, res) {
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/user',
        failureRedirect: '/signup',
        failureFlash: true
    }));


    // locally connect --------------------------------
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/connect/local',
        failureFlash : true
    }));
 

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}