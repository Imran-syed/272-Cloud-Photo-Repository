var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var bcrypt = require('bcrypt');


// set up a mongoose model
var UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstname : String,
    lastname : String,
});


module.exports = mongoose.model('User', UserSchema);
