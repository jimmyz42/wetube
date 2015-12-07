// Model class for Gatherings

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var userModel  = require('./userModel');

/**
key is unique for a gathering, a string by which to get the gathering page
name is name, to display the gathering by
users is an array of the usernames of people in the gathering
host is the username of the person who created the gathering (and has power to end it)
songQueue is an array of spotify song ids
**/
var gatheringSchema = mongoose.Schema({
    key: String,
    name: String,
    users: [String],
    host: String,
    songQueue: [String] //song IDs
});

var gatheringModel = mongoose.model("Gathering", gatheringSchema); 

// Create a gathering
// @param key Key of gathering, used in the URL
// @param host Host/Creator of the gathering
// @return A promise containing the gathering created
exports.create = function(key, host, name) {
    return gatheringModel.create({
        key: key,
        name:name,
        users: [host],
        host: host,
        songQueue: []
    });
};

// Delete a gathering
// @param key Key of gathering to be deleted
// @return A promise that will be fulfilled when removal is complete
exports.delete = function(key) {
    return gatheringModel.remove({
        key: key
    }).exec();
};

// Join a gathering, will not join if already present
// @param key Key of gathering to join
// @param user Username of user that's joining
// @return A promise fulfilled when update is complete
exports.join = function(key, user) {
    return gatheringModel.update({
        key: key
    }, {
        $addToSet: { users: user }
    }).exec();
};

// Leave a gathering
// @param key Key of gathering to leave
// @param user Username of user that's leaving
// @return A promise fulfilled when update is complete
exports.leave = function(key, user) {
    return gatheringModel.update({
        key: key
    }, {
        $pull: { users: user }
    }).exec();
};

// Push a song onto the queue
// @param key Key of gathering 
// @param song ID of song to add to the song queue
// @return A promise fulfilled when the update is complete
exports.pushSong = function(key, song) {
    return gatheringModel.update({
        key: key
    }, {
        $push: { songQueue: song }
    }).exec();
};

exports.clearQueue = function(key){
    return gatheringModel.update({
        key: key
    }, {
        $set: { songQueue: [] }
    }).exec();
};
// Pop a song from the queue
// @param key Key of gathering
// @param song ID of song to remove from the song queue
// @return A promise fulfilled when the update is complete
exports.popSong = function(key) {
    return gatheringModel.update({
        key: key
    }, {
        $pop: { songQueue: -1 } //remove first
    }).exec();
};

// Get a gathering object
// @param key Key of gathering
// @return A promise of the gathering
exports.get = function(key) {
    return gatheringModel.findOne({
        key: key
    }).exec();
};

//@return A promise of the gathering that the user hosts
exports.getHostGathering = function(username){
    return gatheringModel.findOne({
        host:username
    }).exec();
};

//@return A promise of the gathering that the user is part of
exports.getGathering = function(username){
    return gatheringModel.findOne({
        users: {$eq: username}
    }).exec();
};

//Pushes a number of random songs onto the song queue
//@param key key of the gathering
//@param numSongsToAdd the number of songs to add
//@return a promise when the update is complete
var addSongs = function(key, numSongsToAdd){
    // GET RANDOM SONG
    gatheringPromise = exports.get(key);
    for (var i=0; i<numSongsToAdd; i++){
        gatheringPromise.then(function(gathering) {
            var user = gathering.users[Math.floor(Math.random()*gathering.users.length)];
            return userModel.getSongs(user);
        }).then(function(songs) {
            var song = songs[Math.floor(Math.random()*songs.length)];
            exports.pushSong(key, song);
        });
    }
    return gatheringPromise;
};

//Pops any songs currently in the queue, and adds 20 songs 
//@param key of the gathering
//@return promise when the update is complete
exports.maintainSongQueue  = function(key){
    var gatheringPromise = exports.get(key);
    return gatheringPromise.then(function(){
        return gatheringModel.update({
        key: key
        }, {
        songQueue: [] //remove first
        }).exec()
    }).then(function(){
        promiseArray = [];
        for (var i=0; i<20; i++){
            promiseArray.push(gatheringPromise.then(function(gathering) {
                var user = gathering.users[Math.floor(Math.random()*gathering.users.length)];
                return userModel.getUser(user);
            }).then(function(user) {
                /**
                User has A liked artists and S liked songs. 
                Artists count three times as much as songs, so we're more likely to choose a song by artist, 
                and a single track
                **/
                var songs = user.songIDs;
                var artists = user.artists;
                var rand = Math.floor(Math.random() * (artists.length*3+songs.length))
                if (rand < songs.length){
                    //Probability of this is S/(2A+S)
                    var song = songs[rand];
                }
                else{
                    //Probability of this is 2A/(2A+S)
                    var artist = artists[Math.floor((rand-songs.length)/3)];
                    var song = artist.topTracks[Math.floor(Math.random()*artist.topTracks.length)];
                }
                exports.pushSong(key, song);
            }));  
        }
        return Promise.all(promiseArray);
    });
};

//Tells if the key is available
//@param k the key
//@return a promise of if the key is available or not
exports.keyFree = function(k) {
    return gatheringModel.findOne({
        key: k
    }).exec().then(function(key) {
        if(key)
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
Clears all the gatherings in the database
To run tests
**/
exports.clearAll = function(){
    return gatheringModel.remove({}).exec();
}











