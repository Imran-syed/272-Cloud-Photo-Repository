var crypto = require('crypto'),

hash = function (pass, salt) {
    var h = crypto.createHash('sha512');

    h.update(pass);
    h.update(salt);

    return h.digest('base64');
};

exports.hash = hash;