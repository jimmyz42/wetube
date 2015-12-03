/*GET / - WeTube Homepage
GET /login - Login Page
POST /login - Log in to WeTube
GET /account - Create account page
POST /account - Create new Account

***Authentication middleware to make sure they’re signed in***
GET /profile - Current user’s profile page
POST /songs
DELETE /songs     */

var express = require('express');
var userModel = require('../model/userModel');
var gatheringModel = require('../model/gatheringModel');
var spotifyUtils = require('../utils/spotifyUtils');
var utils = require('../utils/utils');
var Promise = require('bluebird');
var sendgrid = require('sendgrid')('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');

var router = express.Router();
/* GET home page. */
router.get('/', function(req, res) {
    console.log(req.session.currentUser);
    console.log(typeof(req.session.currentUser));
    if (req.session.currentUser){
        gatheringModel.getHostGathering(req.session.currentUser).then(function(gathering){
            res.render('homepage', {currentUser:req.session.currentUser, isHost: (gathering!==null)});
        })
    }
    else{
        res.render('index', { title: 'WeTube' });
    }
});

/* POST email */
router.post('/email', function(req, res) { //change to post
    sendgrid.send({
        to: req.body.email.split(','),
        from: req.session.currentUser+'@wetube.com',
        fromname: req.session.currentUser+' (WeTube)',
        subject: req.session.currentUser+' has invited you to join their gathering on WeTube!',
        text: 'Please join my gathering at http://mit-wetube.herokuapp.com/'+req.body.key
    }, function(err, json) {
        if(err) console.log(err);
        console.log(json);
        res.status(200);
        res.end('success');
    });
});

/* GET login page. */
router.get('/login', function(req, res) {
    res.render('login', { title: 'WeTube' });
});

/* POST login */
router.post('/login', function(req, res) {
    userModel.verify(req.body.username, req.body.password)
    .then(function() {
        console.log('matchh');
        req.session.currentUser = req.body.username;
        utils.sendSuccessResponse(res, { user : req.body.username });
    }).catch(function(error) {
        console.log('not matchh');
        res.status(401);
        utils.sendErrResponse(res, 403, 'Username or password invalid.');
    });
});

/* POST login */
router.post('/logout', function(req, res) {
    req.session.currentUser = undefined; 
    utils.sendSuccessResponse(res, "success");
});


/* GET account creation page. */
router.get('/account', function(req, res) {
    res.render('register', { title: 'Express' });
});

/* POST create account */
router.post('/account', function(req, res) {
    console.log("posted");
	console.log('attempted username' + req.body.username);
	userModel.usernameFree(req.body.username).then(function(free)
	{  
		if (free)
		{
			console.log("free equals" + free);
			p1 = userModel.create(req.body.username, req.body.password);
			p2 = p1.then(function() {
				console.log("and then");
				req.session.currentUser = req.body.username;
				utils.sendSuccessResponse(res, { user : req.body.username, created : true });
			}).catch(function(error) {
				res.status(400);
				res.end('error');
				utils.sendErrResponse(res, 403, 'Username or password invalid.');
			});
		}
		else
		{
			utils.sendSuccessResponse(res, { user : req.body.username, created : false });
		}
	});
    //console.log(p1);
    //console.log(p2);
    //console.log("exit");
});

/* GET profile page. */
router.get('/profile', function(req, res) {

    userModel.getSongs(req.session.currentUser).then(function(songids) { // alice don't delete me
        var promiseArray = songids.map(spotifyUtils.getSongInfo);
        Promise.all(promiseArray).then(function(songsArray) {
            userModel.getArtists(req.session.currentUser).then(function(artists){
                var artistPromiseArray = artists.map(spotifyUtils.getArtistInfo);
                Promise.all(artistPromiseArray).then(function(artistsArray){
                    res.render('userProfile', { currentUser: req.session.currentUser, 
                                               artists:artistsArray,
                                               songs:songsArray });
                })
            })
        });
    });
});

router.get('/songs', function(req, res){
   console.log('songstring' + req.query.content);
   spotifyUtils.sendMatches(res, req.query.content);
});

router.get('/artists', function(req, res){
   console.log('artiststring' + req.query.content);
   spotifyUtils.sendArtistMatches(res, req.query.content);
});

/**
GET request to mygathering
Sends a response with the key of the gathering that the current user is a member of, and an 
error otherwise
**/
router.get('/mygathering', function(req, res){
    gatheringModel.getHostGathering(req.session.currentUser).then(function(gathering){
        utils.sendSuccessResponse(res, {key: gathering.key});
    });
});

router.get('/members', function(req, res){
   gatheringModel.getGathering(req.session.currentUser).then(function(gathering){
		if(gathering)
		{
			res.render('members', {gatheringName: gathering.name, 
									host: gathering.host,
									members: gathering.users});
		}
		else
		{
			res.render('membersnone', {user: req.session.currentUser});
		}
		
	});	
});

router.get('/findgathering', function(req, res){
    res.render('joinGathering', {});
});

/* POST add song to list */
router.post('/song', function(req, res) {
    console.log('post to songs');
    console.log('body content' + req.body.content);
    console.log('currentUser' + req.session.currentUser);
    userModel.addSong(req.session.currentUser, req.body.content).then(function(){
        utils.sendSuccessResponse(res, "success");
    });
});

/* POST add artist to list */
router.post('/artist', function(req, res) {
    console.log('post to songs');
    console.log('body content' + req.body.content);
    console.log('currentUser' + req.session.currentUser);
    userModel.addArtist(req.session.currentUser, req.body.content).then(function(){
        utils.sendSuccessResponse(res, "success");
    });
});

/* DELETE delete song from list */
router.delete('/song', function(req, res) {
    console.log(req.body.song);
    userModel.removeSong(req.session.currentUser, req.body.song).then(function(){
        utils.sendSuccessResponse(res, "success");
    }).catch(function(){
        utils.sendErrResponse(res, 500, "error")
    })
});

/* DELETE delete song from list */
router.delete('/artist', function(req, res) {
    userModel.removeArtist(req.session.currentUser, req.body.artist).then(function(){
        utils.sendSuccessResponse(res, "success")
    }).catch(function(){
        utils.sendErrResponse(res, 500, "error")
    })
});

/*
  Require authentication on ALL access to /gathering/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
  /*  if (!req.session.currentUser) {
        utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
    } else {
        next();
    }*/
};

// a middleware sub-stack shows request info for any type of HTTP request to /user/:id
router.use('/songs', requireAuthentication);
router.use('/profile', requireAuthentication);

module.exports = router;
