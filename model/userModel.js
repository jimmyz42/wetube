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
    }).then(function(users) {
        if(users.length > 0) throw 'username taken';
        else return 'okay';
    }).then(function() {
        return userModel.create({
            username: username,
            password: password,
            songIDs: []
        });
    });
};

// Verify user
// @param username Username of user.
// @param password Password to be checked.
// @return A promise containing true if they match, or false if not.
exports.verify = function(username, password) {
    console.log('inside verify');
    console.log(username + password);
    return userModel.findOne({
        username: username
    }).exec().then(function(user) {
        console.log('user' + username);
        console.log('password' + user.password);
        console.log('attempted password' + password);
        if(user.password !== password){
            console.log('passwordmismatch');
            throw 'password mismatch';
        }
        else{
            console.log('password matches');
            return 'success';
        }
        
    });
};

// Add a song for a user, will not add if already present
// @param user Username of user
// @param song ID of song to add
// @return A promise fulfilled when update is complete
exports.addSong = function(user, song) {
    console.log('inside addSong');
    console.log('user' + user);
    console.log('song' + song);
    return userModel.update({
        username: user
    }, {
        $addToSet: { songIDs: song }
    }
    ).exec();
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

// Get song list for user
// @param user Username of user
// @return A promise of an array of songs
exports.getSongs = function(user) {
    return userModel.findOne({
        username: user
    }).exec().then(function(user) {
        return user.songIDs;
    });
};







