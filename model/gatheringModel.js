// Model class for Gatherings

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var songSchema = mongoose.schema({
    id: String,
    booCount: Number
});

var gatheringSchema = mongoose.schema({
    key: String,
    users: [String],
    booLimit: Number,
    host: String,
    songQueue: [songSchema]
});

var gatheringModel = mongoose.model("Gathering", gatheringSchema); 

// Create a gathering
// @param key Key of gathering, used in the URL
// @param host Host/Creator of the gathering
// @return A promise containing the gathering created
exports.create = function(key, host) {
    return gatheringModel.create({
        key: key,
        users: [host]
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

// Join a gathering
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
        key: key,
    }, {
        $pull: { users: user }
    }).exec();
};
















