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
    gatheringModel.create(req.body.key, req.session.currentUser, req.body.name);
    console.log('created thing, about to send response');
    utils.sendSuccessResponse(res, {key: req.body.key});
});

/* GET gathering creation page */
router.get('/', function(req, res) {
    var key = (Math.random()*1e32).toString(36);
    console.log("key" + key + "end of key");
    res.render('createGathering', { key: key });
});

var addSongs = function(req, songsToAdd){
    // GET RANDOM SONG
    for (var i=0; i<songsToAdd; i++){
        gatheringModel.get(req.params.key).then(function(gathering) {
            var user = gathering.users[Math.floor(Math.random()*gathering.users.length)];
            return userModel.getSongs(user);
        }).then(function(songs) {
            var song = songs[Math.floor(Math.random()*songs.length)];
            gatheringModel.pushSong(req.params.key, song);
        });
    }
// END GET RANDOM SONG
}

/* GET gathering page, also join. */
router.get('/:key', function(req, res) {
    console.log('gathering page');
    gatheringModel.join(req.params.key, req.session.currentUser).then(function() {
        return gatheringModel.get(req.params.key);
         /**Jimmy, you're probably going to kill me for butchering the promises stuff here, but I really
        don't understand it and this at least works... */
    })
        //.then(function(gathering){
   //     gatheringModel.clearQueue(req.params.key);
     //   return gathering;
  //  })
    .then(function(gathering) {
        addSongs(req, 4);
        return gatheringModel.get(req.params.key);
    }).then(function(gathering){
            console.log(gathering);
            var songsArray = [];
            var songIds = "";
            console.log('songque' + gathering.songQueue);
            if (gathering.songQueue.length===0){
                res.render('gathering', {gatheringName:gathering.name, 
                                                 host:gathering.host, key:req.params.key,
                                currentUser: req.session.currentUser, songIds:"None",
                                nextSong:{title:"None",artists:"None"},
                                queuedSongs:[]});
            };
            var maxQueueDisplayed = Math.min(6, gathering.songQueue.length);
            for (var i=0; i<maxQueueDisplayed; i++){
                console.log('i' + i);
                songIds = songIds + gathering.songQueue[i] + ",";
                spotifyUtils.getSongInfo(gathering.songQueue[i], function(songInfo){
                    console.log('inside callback');
                    songsArray.push(songInfo);
                    if (songsArray.length===maxQueueDisplayed){
                        res.render('gathering', {gatheringName:gathering.name, 
                                                 host:gathering.host, key:req.params.key,
                                currentUser: req.session.currentUser, songIds:songIds,
                                nextSong:songsArray.slice(1,2)[0],
                                queuedSongs:songsArray.slice(2,songsArray.length)});
                    }
                });
            };
    
        console.log("after gathering");
    }).catch(function(error) {
        console.log(error);
    });
});

/* DELETE gathering, also destroy gathering if host */
router.delete('/:key', function(req, res, next) {
    gatheringModel.get(req.params.key).then(function(gathering) {
        if(gathering.host === req.session.currentUser) {
            return gatheringModel.delete(req.params.key);
        } else {
            return gatheringModel.leave(req.params.key, req.session.currentUser);
        }
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


