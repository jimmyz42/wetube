/*GET / - WeTube Homepage (or login page)
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
var multer = require('multer');
var Hashes = require('jshashes');

//var upload = multer({ dest: __dirname+'/../public/images/user/' });
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, __dirname+'/../public/images/user/');
    },
    filename: function(req, file, cb) {
        cb(null, req.session.currentUser+'.jpg');
    }
});
var upload = multer({ storage: storage });

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

var router = express.Router();

// a middleware sub-stack shows request info for any type of HTTP request to /user/:id
router.use('/songs', requireAuthentication);
router.use('/song', requireAuthentication);
router.use('/artist', requireAuthentication);
router.use('/profile', requireAuthentication);
router.use('/artists', requireAuthentication);

/* GET home page.
If logged in, renders homgepage
Else, renders login page*/
router.get('/', function(req, res) {
    if (req.session.currentUser){
        gatheringModel.getHostGathering(req.session.currentUser).then(function(gathering){
            res.render('homepage', {currentUser:req.session.currentUser, isHost: (gathering!==null)});
        })
    }
    else{
        res.render('index', { title: 'WeTube' });
    }
});

/* POST upload profile image */
router.post('/upload', upload.single('file'), function(req, res) {
    console.log(req.file);
    console.log(__dirname);
    res.status(200);
    res.send(req.file);
    res.end();    
});

/* POST email 
Sends email to people to invite them to a gathering */
router.post('/email', function(req, res) { //change to post
    sendgrid.send({
        to: req.body.email.split(','),
        from: req.session.currentUser+'@wetube.com',
        fromname: req.session.currentUser+' (WeTube)',
        subject: req.session.currentUser+' has invited you to join their gathering on WeTube!',
        text: 'Please join my gathering at http://mit-wetube.herokuapp.com/gathering/'+req.body.key
    }, function(err, json) {
        if(err) console.log(err);
        console.log(json);
        res.status(200);
        res.end('success');
    });
});

/* POST login 
Checks that password is correct, and logs in the current user*/
router.post('/login', function(req, res) {
	var salt = new Hashes.SHA1().b64("");
	var hashedPassword = new Hashes.SHA1().b64(req.body.password.concat(salt));
    userModel.verify(req.body.username, hashedPassword)
    .then(function() {
        req.session.currentUser = req.body.username;
        utils.sendSuccessResponse(res, { user : req.body.username });
    }).catch(function(error) {
        res.status(401);
        utils.sendErrResponse(res, 403, 'Username or password invalid.');
    });
});

/* POST logout
Logs out the current user */
router.post('/logout', function(req, res) {
	gatheringModel.getGathering(req.session.currentUser)
    .then(function(gathering) {
		if(gathering)
		{
            console.log(gathering.name);
			return gatheringModel.leave(gathering.key, req.session.currentUser)
        }
        else{
            return "not in gathering now"
        }
    }).then(function(){
            req.session.currentUser = undefined;
            utils.sendSuccessResponse(res, "success");
    }).catch(function(error) {
		utils.sendErrResponse(res, 500, 'Unable to sign out.');
	});
});

/* GET account creation page. */
router.get('/account', function(req, res) {
    res.render('register', { title: 'Express' });
});

/* POST create account 
Register a new user
If username is already taken, sends a response that says it was not created*/
router.post('/account', function(req, res) {
	userModel.usernameFree(req.body.username).then(function(free)
	{  
		if (free)
		{
			console.log("free equals" + free);
			var salt = new Hashes.SHA1().b64("");
			var hashedPassword = new Hashes.SHA1().b64(req.body.password.concat(salt));
			p1 = userModel.create(req.body.username, hashedPassword);
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
});

/* GET profile page. */
router.get('/profile', function(req, res) {
    console.log('get profile');
    userModel.getSongs(req.session.currentUser).then(function(songids) { // alice don't delete me
        console.log('songids length');
        console.log(songids.length);
        spotifyUtils.getSongsInfo(songids)
            .then(function(songsArray) {
                console.log('songsarray length');
                console.log(songsArray.length);
                userModel.getArtists(req.session.currentUser)
                .then(function(artists){
                spotifyUtils.getArtistsInfo(artists)
                .then(function(artistsArray){
                    res.render('userProfile', { currentUser: req.session.currentUser, 
                                               artists:artistsArray,
                                               authlink: spotifyUtils.getAuthorizeURL(),
                                               songs:songsArray });
                })
            })
        }); 
    });
});

/*Called after the user authenticates themselves with spotify
Sets all the necessary authentication parameters, then redirects to 
appropriate page */
router.get('/callback', function(req, res){
    var code  = req.query.code; // Read the authorization code from the query parameters
    var state = req.query.state;
    spotifyUtils.setAuthorizeInfo(code, state).then(function(){
        res.redirect('/import');
    });
});
    
//Gets the page that shows all the user's playlist names, so they 
//can choose ones to import from
router.get('/import', function(req, res){
    spotifyUtils.getPlaylistInfo().then(function(myPlaylists){
          res.render('importplaylist', {playlists:myPlaylists});
    });
});

//Imports from the playlists 
//req.body.content, when parsed, is an array of playlist objects, that have properties
//  ownerID and playlistID
//Adds all the songs in these playlists to the user's liked songs list
router.post('/import', function(req, res){
    var playlistObjs = JSON.parse(req.body.content);
    var promiseArray = playlistObjs.map(spotifyUtils.getPlaylistTracks);
    Promise.reduce(promiseArray, function(total, tracks) {
        return total.concat(tracks);
    }, []).then(function(allTracks) {
        console.log('allTracks');
        console.log(allTracks);
        return userModel.addSongs(req.session.currentUser, allTracks);
    }).then(function(){
        utils.sendSuccessResponse(res, "success");
    });
});

//Get songs 
//Searches for songs that match the searchstring in req.query.content
//Sends back an array of matches objects
router.get('/songs', function(req, res){
   spotifyUtils.getTrackMatches(req.query.content).then(function(matchedSongs){
       utils.sendSuccessResponse(res, { songs : matchedSongs });
   }).catch(function(err){
        utils.sendErrResponse('Error in finding matches');
   });
});

//Get artists 
//Searches for artists that match the searchstring in req.query.content
//Sends back an array of match objects
router.get('/artists', function(req, res){
    spotifyUtils.getArtistMatches(req.query.content).then(function(matchedSongs){
         utils.sendSuccessResponse(res, { artists : matchedArtists });
   }).catch(function(err){
        utils.sendErrResponse('Error in finding matches');
   });
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

/*Get members page*/
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

/*Get find gathering page */
router.get('/findgathering', function(req, res){
    res.render('joinGathering', {});
});

/* POST add song to list */
router.post('/song', function(req, res) {
    userModel.addSong(req.session.currentUser, req.body.content).then(function(){
        utils.sendSuccessResponse(res, "success");
    });
});

/* POST add artist to list */
router.post('/artist', function(req, res) {
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

module.exports = router;
