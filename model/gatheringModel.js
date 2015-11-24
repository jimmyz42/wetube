// Model class for Gatherings

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var gatheringSchema = mongoose.Schema({
    key: String,
    users: [String],
    booLimit: Number,
    host: String,
    songQueue: [{
        id: String,
        booCount: Number
    }]
});

var gatheringModel = mongoose.model("Gathering", gatheringSchema); 

// Create a gathering
// @param key Key of gathering, used in the URL
// @param host Host/Creator of the gathering
// @return A promise containing the gathering created
exports.create = function(key, host) {
    return gatheringModel.create({
        key: key,
        users: [host],
        booLimit: 2, // TODO change for final
        host: host,
        songQueue: []
    }).exec();
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
        $push: { songQueue: { id: song, booCount: 0 } }
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


















