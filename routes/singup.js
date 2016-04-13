var mysql = require('./mysql');
//var express = require('express');
//var router = express.Router();
//var passwordHash = require('../node_modules/password-hash');
var hashFunction = require('./hashFunction'); //Check for

function createUser(req,res) {
	console.log("Creating user profile");
	try
	{
		var checkEmailQuery = "select email from user where email = '"+ req.param('email') +"';";
		console.log(checkEmailQuery);
		mysql.fetchData(function(err, result) {
			if(err) {
				console.log('Fetchdata error in create user: ' + err);
				throw err;
			} else {
				if(result.length>0) {
					res.render('signup', {error:true});
				} else {
					var passwordHash = hashFunction.hash(req.param('password'), req.param('email'));
					console.log(passwordHash);
					var createUserQuery = "insert into user (firstname, lastname, email, password, sex) values ('" 
						+ req.param('firstName') + "','"
						+ req.param('lastName') + "','"
						+ req.param('email') + "','"
						+ passwordHash +"');";
					console.log("\n"+createUserQuery);
					
					mysql.fetchData(function(err, results) {
						if(err) {
							console.log('Fetchdata error in create user: ' + err);
							throw err;
						} else {
							res.render('main',  { message: 'Please enter your login credentials', error: false}, function(err, results) {
								if (!err) {
									res.end(results);
						        }
						        else {
						            res.end('An error occurred');
						            console.log(err);
						        }
							});
						}
					}, createUserQuery);
				}
			}
		},checkEmailQuery);
	
	} catch (e) {
		console.log("Exception: " + e);
	}
	
}

exports.createUser = createUser;

function getSignup(req,res) {
	console.log("Redirecting to signup");
	res.render('signup', {error:false});
}

exports.getSignup = getSignup;