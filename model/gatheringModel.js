// Model class for Gatherings

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var userModel  = require('./userModel');

var gatheringSchema = mongoose.Schema({
    key: String,
    name: String,
    users: [String],
    booLimit: Number,
    host: String,
    songQueue: [String] //song IDs
});

var gatheringModel = mongoose.model("Gathering", gatheringSchema); 

// Create a gathering
// @param key Key of gathering, used in the URL
// @param host Host/Creator of the gathering
// @return A promise containing the gathering created
exports.create = function(key, host, name) {
    console.log("key model" + key + "end of key");
    return gatheringModel.create({
        key: key,
        name:name,
        users: [host],
        booLimit: 2, // TODO change for final
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

/* HOW TO USE PROMISES
/*gatheringModel.join(key, user).then(function(){
    return gatheringModel.leave(key, user);
}).then(function(){
    return gatheringModel.get(key);
}).then(function(gathering){
    return gathering.key;
}).then(function(key)*/

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
exports.popSong = function(key, song) {
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
    console.log('get host gathering for ' + username);
    return gatheringModel.findOne({
        host:username
    }).exec();
};

//@return A promise of the gathering that the user is part of
exports.getGathering = function(username){
    console.log('get gathering with' + username);
    return gatheringModel.findOne({
        users: {$eq: username}
    }).exec();
};

//Pushes a random song onto the song queue
var addSongs = function(key, numSongsToAdd){
    // GET RANDOM SONG
    gatheringPromise = exports.get(key);
    for (var i=0; i<numSongsToAdd; i++){
        gatheringPromise.then(function(gathering) {
            var user = gathering.users[Math.floor(Math.random()*gathering.users.length)];
            return userModel.getSongs(user);
        }).then(function(songs) {
            var song = songs[Math.floor(Math.random()*songs.length)];
            console.log('pushing song number ' + i);
            exports.pushSong(key, song);
        });
    }
    return gatheringPromise;
};

//If the queue has songs, pops the first song and adds a new random one. 
//If the queue is empty, adds 6 random songs. 
//
exports.maintainSongQueue  = function(key){
    
    var gatheringPromise = exports.get(key);
    return gatheringPromise.then(function(gathering){
        if (gathering.songQueue.length >0){
            console.log('popping');
            exports.popSong(key);
            return gathering.songQueue.length - 1;
        };
        return gathering.songQueue.length;
    }).then(function(currentQueueLength){
        promiseArray = [];
        for (var i=0; i<6-currentQueueLength; i++){
            promiseArray.push(gatheringPromise.then(function(gathering) {
                var user = gathering.users[Math.floor(Math.random()*gathering.users.length)];
                return userModel.getSongs(user);
            }).then(function(songs) {
                var song = songs[Math.floor(Math.random()*songs.length)];
                console.log('pushing song number ' + i);
                exports.pushSong(key, song);
            }));  
        }
        return Promise.all(promiseArray);
    });
}; 
















