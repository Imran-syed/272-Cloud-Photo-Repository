//var mongoose    = require('mongoose');
var config      = require('../config/mongoConnect'); // get db config file
var user    = require('../models/user.model');

//mongoose.connect(config.database);

var userRouter = function(app) {

    app.get("/user", function (req, res) {
        res.send("Hello User");
    });

    app.post('/signup', function(req, res) {
        console.log('email : ' + req.body.email);
        if (!req.body.email || !req.body.password) {
            res.status(200).json({success: false, msg: 'Please pass name and password.'});
        } else {
            var newUser = new user({
                email: req.body.email,
                password: req.body.password
            });
            // save the user
            newUser.save(function(err) {
                if (err) {
                    console.log('error :' +err);
                    //return res.json(400,{success: false, msg: 'Username already exists.'});
                    return res.status(400).json({success: false, msg: 'Username already exists.'});
                }
                res.status(200).json({success: true, msg: 'Successful created new Customer.'});
            });
        }
    });
};

module.exports = userRouter;