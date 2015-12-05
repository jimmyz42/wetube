//User Model

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var spotifyUtils = require('../utils/spotifyUtils');

// A list of users, with their favorite songs
/**
artistsIDs are the spotify ids of artists they like
allSongIDs are the spotify ids of songs they like, plus the top 8 track ids
by artists they like 
**/
var userSchema = mongoose.Schema({
    username: String,
    password: String,
    songIDs: [String],
    artists: [{id:String, topTracks:[String]}] 
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
    }).exec();
};

// Add an array of songs for a user, will not add if already present
// @param user Username of user
// @param song ID of song to add
// @return A promise fulfilled when update is complete
exports.addSongs = function(user, songs) {
    console.log('inside addSong');
    console.log('user' + user);
    console.log('song' + songs);
    return userModel.update({
        username: user
    }, {
        $addToSet: { songIDs: { $each: songs } } 
    }).exec();
};


// Add a artist for a user, will not add if already present
// @param user Username of user
// @param artist ID of artist to add
// @return A promise fulfilled when update is complete
exports.addArtist = function(user, artistid) {
    console.log('user' + user);
    console.log('song' + artist);
    return spotifyUtils.getTopTracksForArtist(artistid).then(function(topTrackIds){
        return userModel.update({
            username: user
        }, {
            $addToSet: {artists: {id:artistid, topTracks:topTrackIds}}
        }
        ).exec();
    });
};

// Remove a song for a user, if present
// @param user Username of user
// @param song ID of song to remove
// @return A promise fulfilled when update is complete
exports.removeSong = function(user, song) {
    return userModel.update({
        username: user,
    }, {
        $pull: { songIDs: song }
    }).exec();
};

// Remove a artist for a user, if present
// @param user Username of user
// @param artist ID of artist to remove
// @return A promise fulfilled when update is complete
exports.removeArtist = function(user, artistid) {
    return userModel.update({
        username: user,
    }, {
        $pull: { artists: {id:artistid} }
    }).exec();
};

// Get liked songs list for user
// @param user Username of user
// @return A promise of an array of songs
exports.getSongs = function(user) {
    return userModel.findOne({
        username: user
    }).exec().then(function(user) {
        return user.songIDs;
    });
};

// Get artist list for user
// @param user Username of user
// @return A promise of an array of artist
exports.getArtists = function(user) {
    return userModel.findOne({
        username: user
    }).exec().then(function(user) {
        return user.artists;
    });
};

/**
Gets the user object with username user
@param user Username of user
@return A promise of the user
**/
exports.getUser = function(user){
    return userModel.findOne({
        username:user
    }).exec();
}

// Check whether a username is available
// @param user Username of user
// @return true if name is unused
exports.usernameFree = function(uname) {
    return userModel.findOne({
        username: uname
    }).exec().then(function(user) {
		console.log('found a user');
        if(user)
		{
			console.log('taken?');
			return false;
		}
		else
		{	
			return true;
		}
    });
};






