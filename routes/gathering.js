/****Authentication middleware to make sure they’re signed in***
POST /gathering - create a gathering with key as a form param
GET /gathering/{key} - GET the gathering, also join the gathering
DELETE /gathering/{key} - delete the gathering if host, else remove user from gathering with onbeforeload
(POST /gathering/boo)*/

var express = require('express');
var userModel = require('../model/userModel');
var gatheringModel = require('../model/gatheringModel');
var utils = require('../utils/utils');
var router = express.Router();
var spotifyUtils = require('../utils/spotifyUtils');

/* POST create gathering */
router.post('/', function(req, res) {
    console.log('inside router post');
    console.log(req.body.key + req.session.currentUser);
	songIDs = userModel.getSongs(req.session.currentUser);
	created = false;
	if(songIDs.length > 0)
	{
		gatheringModel.create(req.body.key, req.session.currentUser, req.body.name);
		created = true;
	}
	console.log(created);
    console.log('created thing, about to send response');
    utils.sendSuccessResponse(res, {key: req.body.key, created: created});
});

/* GET gathering creation page */
router.get('/', function(req, res) {
    var key = (Math.random()*1e32).toString(36);
    console.log("key" + key + "end of key");
    res.render('createGathering', { key: key });
});

var addSongs = function(req, songsToAdd){
    // GET RANDOM SONG
    gatheringPromise = gatheringModel.get(req.params.key);
    for (var i=0; i<songsToAdd; i++){
        gatheringPromise.then(function(gathering) {
            var user = gathering.users[Math.floor(Math.random()*gathering.users.length)];
            return userModel.getSongs(user);
        }).then(function(songs) {
            var song = songs[Math.floor(Math.random()*songs.length)];
            gatheringModel.pushSong(req.params.key, song);
        });
    }    
// END GET RANDOM SONG
}

/* GET gathering page, also join. 

If queue is not empty:
Pop from front of queue (that was the last song played), 
Push one more onto end of queue. 
Play the first on the queue. 

If queue is empty:
Push 6 onto the queue (Let's maintain like 6 or something, so currently playing, next, and 4 upcoming)

currentSongId is the song id of the first song in the queue

*/
router.get('/:key', function(req, res) {
    console.log('gathering page');
	gatheringModel.get(req.params.key)
	.then(function(thisgathering) {
		if(thisgathering)
		{
			gatheringModel.join(req.params.key, req.session.currentUser)
			.then(function(){
				console.log('1');
				return gatheringModel.maintainSongQueue(req.params.key);
			}).then(function() {
				console.log('2');
				return gatheringModel.get(req.params.key);
			}).then(function(gathering){
				console.log('3' + gathering);
				promiseArray = gathering.songQueue.map(spotifyUtils.getSongInfo);
				Promise.all(promiseArray).then(function(songsArray){
					res.render('gathering', {gatheringName:gathering.name, 
														 host:gathering.host, key:req.params.key,
										currentSongLength: songsArray[0].duration,
										currentUser: req.session.currentUser, currentSongId:gathering.songQueue[0],
										queuedSongs:songsArray});
				});
			}).catch(function(error) {
				console.log(error);
			});
		}
		else
		{
			res.render('invalidGathering', {key:req.params.key});
		}  
	});
});

/* DELETE gathering, also destroy gathering if host */
router.delete('/:key', function(req, res) {
    gatheringModel.get(req.params.key).then(function(gathering) {
        if(gathering.host === req.session.currentUser) {
            return gatheringModel.delete(req.params.key);
        } else {
            return gatheringModel.leave(req.params.key, req.session.currentUser);
        }
    }).then(function(){
        utils.sendSuccessResponse(res, 'successfully deleted');
    }).catch(function(){
        utils.sendErrResponse(res, 500, 'err');
    });
});

/*
  Require authentication on ALL access to /gathering/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
    if (!req.session.currentUser) {
        utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
    } else {
        next();
    }
};

// Register the middleware handlers above.
router.all('*', requireAuthentication);

module.exports = router;


