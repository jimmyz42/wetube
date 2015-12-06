/*POST /gathering - create a gathering with key as a form param
GET /gathering/{key} - GET the gathering, also join the gathering
DELETE /gathering/{key} - delete the gathering if host, else remove user from gathering with onbeforeload
*/

var express = require('express');
var userModel = require('../model/userModel');
var gatheringModel = require('../model/gatheringModel');
var utils = require('../utils/utils');
var router = express.Router();
var spotifyUtils = require('../utils/spotifyUtils');

/*
  Require authentication on ALL access to /gathering/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
    if (!req.session.currentUser) {
        res.render('index', { title: 'WeTube' });
    //    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
    } else {
        console.log('next');
        next();
    }
};

// Register the middleware handlers above.
router.all('*', requireAuthentication);

/* POST to create a new gathering in the database
//@param req.body.key is the key of the new gathering*/
router.post('/', function(req, res) {
    console.log('inside router post');
    console.log(req.body.key + req.session.currentUser);
	gatheringModel.keyFree(req.body.key).then(function(isFree)
	{
		userModel.getUser(req.session.currentUser).then(function(user){
		created = false;
        var songIDs = user.songIDs;
        var artists = user.artists;
		if(isFree)
		{
			if(songIDs.length > 0 || artists.length > 0)
			{
				console.log("SONG IDS LENGTH" + songIDs.length);
				gatheringModel.create(req.body.key, req.session.currentUser, req.body.name);
				created = true;
			}
		}
		console.log('created thing, about to send response');
		utils.sendSuccessResponse(res, {key: req.body.key, created: created, keyFree: isFree});
		});
	});
});

/* GET gathering creation page */
router.get('/', function(req, res) {
    res.render('createGathering');
});

/* GET gathering page, also join. 
Empty the current queue and push 15 new songs onto it
Render the gathering page, passing in the song ids on the queue, and information about them
currentSongId is the song id of the first song in the queue
*/
router.get('/:key', function(req, res) {
    gatheringModel.keyFree(req.params.key).then(function(isFree){
        if (isFree){
            console.log('KEY DOES NOT EXIST');
            res.render('error', {error:'Gathering does not exist'});
        }
        else{
            return;
        }
    }).then(function(){
        return gatheringModel.join(req.params.key, req.session.currentUser)
    }).then(function(){
        return gatheringModel.maintainSongQueue(req.params.key);
    }).then(function() {
        return gatheringModel.get(req.params.key);
    }).then(function(gathering){
        spotifyUtils.getSongsInfo(gathering.songQueue)
        .then(function(songsArray){
            console.log('gathering');
            console.log(gathering)
            console.log('gathering.songQueue');
            console.log(gathering.songQueue);
            console.log(gathering.songQueue[0]);
            var tracksString = "";
            for (var i=0; i<gathering.songQueue.length; i++){
                tracksString = tracksString + gathering.songQueue[i] + ",";
            }
            
            console.log('tracksstring');
            console.log(tracksString);
            res.render('gathering', {gatheringName:gathering.name, 
                                                 host:gathering.host, members:gathering.users, key:req.params.key,
                                trackids: tracksString,
                                currentUser: req.session.currentUser, currentSongId:gathering.songQueue[0],
                                queuedSongs:songsArray});
        });
    }).catch(function(error) {
        console.log(error);
    });
});

/* DELETE gathering, 
//If not host, remove the current user from the gathering members
//If host, also destroy gathering in database */
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

module.exports = router;


