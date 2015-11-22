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
    return userModel.find({
        username: username
    }).exec().then(function(users) {
        if(users.length > 0) throw 'username taken';
    }).then(function() {
        return userModel.create({
            username: username,
            password: password,
            songIDs: []
        }).exec();
    });
};

// Create user
// @param username Username of user.
// @param password Password to be checked.
// @return A promise containing true if they match, or false if not.
exports.verify = function(username, password) {
    return userModel.findOne({
        username: username
    }).exec().then(function(user) {
        if(user.password !== password) throw 'password mismatch';
    });
};

// Add a song for a user, will not add if already present
// @param user Username of user
// @param song ID of song to add
// @return A promise fulfilled when update is complete
exports.addSong = function(user, song) {
    return userModel.update({
        user: user
    }, {
        $addToSet: { songIDs: song }
    }).exec();
};

// Remove a song for a user, if present
// @param user Username of user
// @param song ID of song to remove
// @return A promise fulfilled when update is complete
exports.removeSong = function(user, song) {
    return userModel.update({
        user: user,
    }, {
        $pull: { songIDs: song }
    }).exec();
};









