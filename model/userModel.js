//User Model

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// A list of users, with their favorite songs
var userSchema = mongoose.Schema({
    username: String,
    password: String,
    songIDs: [String]
});

var userModel = mongoose.model("User", userSchema);

// Create user
// @param username Username of user to be created.
// @param password Password of user to be created.
// @return A promise containing the user created.
exports.create = function(username, password) {
    return userModel.create({
        username: username,
        password: password,
        songIDs: []
    }).exec();
};

// Create user
// @param username Username of user.
// @param password Password to be checked.
// @return A promise containing true if they match, or false if not.
exports.verify = function(username, password) {
    return userModel.findOne({
        username: username
    }).exec().then(function(user) {
        return user.password === password;
    });
};










