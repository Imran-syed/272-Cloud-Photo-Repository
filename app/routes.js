var multer = require('multer');
var Imagemin = require('imagemin');
var fs = require('fs');
var async = require('async');
var device       = require('./models/deviceImage.model');
var userModel =  require('./models/user.model');

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

    //USER HOME =============================
    app.get('/userhome', isLoggedIn, function (req, res) {

        var user = req.user;
        var query = userModel.findOne({'_id':user._id}).select('local.devices');

        query.exec(function (err, doc) {
            if (err) return next(err);
            var temp =deviceName;
            res.render('userhome.ejs', {
                deviceId: temp,
                clients: doc.local.devices,
                 });
            console.log(doc.local.devices);
        });

    });

    //USER PHOTOS============================
    app.get('/photos',  isLoggedIn, function (req, res) {
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
        successRedirect: '/userhome',
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
        successRedirect: '/userhome',
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


    //Handling the registration of devices
    app.post('/api/register',isLoggedIn, function(req,res){
        var user = req.user;
        console.log(user._id);
        console.log(req.body.deviceName);

        userModel.findByIdAndUpdate(
            user._id,
            {$push: {'local.devices': req.body.deviceName}},
            {safe: true, upsert: true},
            function(err, model) {
                if(err)
                {
                    res.status(400).json({
                        success: false,
                        msg: 'could not register the device'
                    });

                }
                else {
                    res.redirect('/userhome');
                }
            }
        );


    });

    app.post('/api/setdevice',isLoggedIn,function(req,res){
        console.log("The device is :" + req.body.deviceSelect)
        deviceName =  req.body.deviceSelect;
        res.redirect('/userhome');
    });

    //==================================================================
    //Photos logic
    //==================================================================

    app.use(function (req, res, next) {
        var imgs = ['png','jpg','JPG'];  //Imran: have to move somewhere ! but not here
        var handler = multer({
            inMemory: false, // TODO set this to true, currently writes output to disk
            dest: './static/tmp/',
            limits: { // Restrict to 5mg
                fileSize: 5 * 1024 * 1024,
                fieldNameSize: 100,
                files: 5,
                fields: 8
            },
            onFileUploadComplete: function (file) {
                console.log(file.originalname + ' finished...');
            },
            onError: function (error, next) {
                console.log(error);
                next(error);
            },
            onFileSizeLimit: function (file) {
                console.log('Failed: ', file.originalname)
                fs.unlink('./' + file.path) // delete the partially written file
            },
            onFileUploadStart: function (file) {
                if (imgs.indexOf(file.extension) == -1) {
                    console.log(file.extension + ' not supported: ')
                    return false;
                }
            }
        });

        handler(req, res, next);
    });




// Handle uploading of new images
    app.post('/api/upload',isLoggedIn ,function (req, res) {
        console.log("REQUEST param: "+ JSON.stringify(req.params));
        console.log("1");
        console.log("The device is : "+deviceName);
        if (Object.keys(req.files).length === 0) {
            console.log("2");
            res.statusCode = 500;
            return res.send({error: 'Server error'});
        } else {
           // console.log('File Details ' + JSON.stringify(req.files));

            // Step 2. Iterate files and update task when optimisation is completed
            var fileList = [].concat(req.files.userFile);


            console.log(req.files.userFile);

            console.log("3");

            var minifiedBaseImages = [];

            async.each(fileList, function (fileItem, done) {

                // Create imagemin and optimize uploaded files
                console.log("4");
                var imagemin = new Imagemin()
                    .src(fileItem.path)
                    .use(Imagemin.jpegtran({progressive: true}))
                    .use(Imagemin.pngquant());

                // When files have finished processing, update new task
                imagemin.run(function (err, files) {
                    if (err) {
                        console.log('Error on optmization!' + err);
                    }

                    files.forEach(function (tmpFile) {
                        console.log(tmpFile.contents.length);
                        minifiedBaseImages.push(new Buffer(tmpFile.contents).toString('base64'));
                        console.log('Optmization on file is complete and appended to list');
                    });

                    done();
                });
            }, function (err) {
                if (err) {
                    console.log('error during minfication', err)
                    return next(err); //assumes you're using express with a next parameter
                }

                var task;
                if(req.user)
                {
                    var user = req.user;
                    var query = device.findOne({'email':user.local.email, 'name':deviceName});

                    query.exec(function (err, doc) {
                        if (err) return next(err);
                        //console.log(doc);
                        if(doc==null)
                        {
                            console.log(req.user.local.email);
                            task = new device({
                                email: req.user.local.email,
                                name:deviceName,
                                createdAt: Date.now()
                            });

                            // Append optmized images
                            for (var x = 0; x < minifiedBaseImages.length; x++) {
                                task.imgs.push({bin: minifiedBaseImages[x]});
                            }

                            // Save task with everything in it
                            task.save(function (err) {
                                if (!err) {
                                    console.log("Image compressed and task updated");
                                    deviceName = "Choose Device";
                                } else {
                                    console.log(err);
                                    return next(err);
                                }
                            });


                        }
                        else {
                            // Append optmized images
                            for (var x = 0; x < minifiedBaseImages.length; x++) {
                                doc.imgs.push({bin: minifiedBaseImages[x]});
                            }

                            doc.save(function (err) {
                                if (!err) {
                                    console.log("New Image pushed ");
                                    deviceName = "Choose Device";
                                } else {
                                    console.log(err);
                                    return next(err);
                                }
                            });
                        }

                    });

                }

            });

            res.statusCode = 200;
            res.json({
                success: true
            });
        }
    });

// Say hi!
    app.get('/api', function (req, res) {
        res.json({message: 'API is running'});
    });

// Show ALL tasks restricted to 10 and sorted descending
    app.get('/api/tasks',isLoggedIn, function (req, res) {
        var user = req.user;
        return device.find({'email':user.local.email},function (err, tasks) {
            if (err || !tasks) {
                res.statusCode = 500;
                return res.json({error: 'Server Error'});
            } else {
                return res.json(tasks);
            }
        }).sort([['createdAt', 'descending']]).limit(10);
    });

// Show a specific task
    app.get('/api/tasks/:taskid',isLoggedIn, function (req, res) {
        return device.findById(req.param('taskid'), function (err, task) {
            if (err || !task) {
                res.statusCode = 500;
                return res.json({error: 'Task not found'});
            } else {
                return res.json(task);
            }
        });
    });

// Show image details belonging to a task
    app.get('/api/task/:taskid/image/:imgId',isLoggedIn, function (req, res) {

        return device.findById(req.param('taskid'), function (err, task) {
            if (err || !task) {
                res.statusCode = 500;
                return res.json({error: 'Task not found'});
            } else {
                console.log("Found task, looking for image " + req.params.imgId);

                var img = task.imgs.id(req.params.imgId);
                if (err || !img) {
                    res.statusCode = 500;
                    return res.json({error: 'Image not found'});
                } else {
                    var base64Image = new Buffer(img.bin, 'base64');
                    res.writeHead(200, {'Content-Length': base64Image.length, 'Content-Type': 'image/png'});
                    res.end(base64Image);
                }
            }
        });
    });

};


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}