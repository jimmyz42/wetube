//User Model

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var spotifyUtils = require('../utils/spotifyUtils');
var fs = require('fs');

// A list of users, with their favorite songs
/**
username is a unique identifier for each user (it serves as the _id here)
password is the hash of the person's password
songIDs is an array of the spotify ids of songs they like
artists is an array of artist objects, which have property id (the spotify id of the artist), and 
    topTracks, which is an array of spotify ids of their top songs
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
        fs.createReadStream(__dirname+'/../public/images/DefaultProfile.jpg')
            .pipe(fs.createWriteStream(__dirname+'/../public/images/user/'+username+'.jpg'));        
        return userModel.create({
            username: username,
            password: password,
            songIDs: [], 
            artists:[]
        });
    });
};

// Verify user
// @param username Username of user.
// @param password Password to be checked.
// @return A promise containing true if they match, or false if not.
exports.verify = function(username, password) {
    return userModel.findOne({
        username: username
    }).exec().then(function(user) {
        if(user.password !== password){
            throw 'password mismatch';
        }
        else{
            return 'success';
        }
    });
};

// Add a song for a user, will not add if already present
// @param user Username of user
// @param song ID of song to add
// @return A promise fulfilled when update is complete
exports.addSong = function(user, song) {
    return userModel.update({
        username: user
    }, {
        $addToSet: { songIDs: song }
    }).exec();
};

// Add an array of songs for a user, will not add if already present
// @param user Username of user
// @param songs IDs of songs to add
// @return A promise fulfilled when update is complete
exports.addSongs = function(user, songs) {
    return userModel.update({
        username: user
    }, {
        $addToSet: { songIDs: { $each: songs } } 
    }).exec();
};


// Add an artist for a user, will not add if already present
// @param user Username of user
// @param artist ID of artist to add
// @return A promise fulfilled when update is complete
exports.addArtist = function(user, artistid) {
    return spotifyUtils.getTopTracksForArtist(artistid).then(function(topTrackIds){
        return userModel.findOne({
            username:user
        }).exec().then(function(user){
            var artistExists = false;
            for (var i=0; i<user.artists.length; i++){
                if (user.artists[i].id===artistid){
                    artistExists = true;
                }
            }
            return artistExists;
        }).then(function(artistExists){
            if (!(artistExists)){
                return userModel.update({
                    username: user
                }, {
                $addToSet: {artists: {id:artistid, topTracks:topTrackIds}}
                }).exec();
            }
            else{
                console.log('not adding');
                return "artist already exists";
            }
        });     
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
        if(user)
		{
			return false;
		}
		else
		{	
			return true;
		}
    });
};

/**
Clears all the users in the database
To run tests
For testing purposes only
**/
exports.clearAll = function(){
    return userModel.remove({}).exec();
}






