var hashFunction = require('./hashFunction');

function createUser(req,res) {
	console.log("Creating user profile");
	try
	{
		
		// check if email exists ? 
		console.log(checkEmailQuery);
		mongodb.fetch(function(err, result) {
			if(err) {
				console.log('Fetchdata error in create user: ' + err);
				throw err;
			} else {
				if(result.length>0) {
					res.render('signup', {error:true});
				} else {
					var passwordHash = hashFunction.hash(req.param('password'), req.param('email'));
					console.log(passwordHash);

					 mongodb.createUser(
							 function(err, results) {
						if(err) {
							console.log('Fetchdata error in create user: ' + err);
							throw err;
						} else {
							res.render('pages/signin',   function(err, results) {
								if (!err) {
									res.end(results);
						        }
						        else {
						            res.end('An error occurred');
						            console.log(err);
						        }
							});
						}
					}, req.param('firstName') ,req.param('lastName') ,req.param('email') ,passwordHash);
				}
			}
		},req.param('email'));
	
	} catch (e) {
		console.log("Exception: " + e);
	}
	
}

exports.createUser = createUser;

function getSignup(req,res) {
	console.log("Redirecting to signup");
	res.render('pages/signup', {error:false});
}

exports.getSignup = getSignup;