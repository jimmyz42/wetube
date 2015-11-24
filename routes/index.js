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
var spotifyUtils = require('../utils/spotifyUtils');
var utils = require('../utils/utils');

var router = express.Router();
/* GET home page. */
router.get('/', function(req, res) {
    console.log(req.session.currentUser);
    console.log(typeof(req.session.currentUser));
    if (req.session.currentUser){
        res.render('homepage', {currentUser:req.session.currentUser});
    }
    else{
        res.render('index', { title: 'WeTube' });
    }
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

/* GET account creation page. */
router.get('/account', function(req, res) {
    res.render('register', { title: 'Express' });
});

/* POST create account */
router.post('/account', function(req, res) {
    console.log("posted");
    p1 = userModel.create(req.body.username, req.body.password);
    p2 = p1.then(function() {
        console.log("and then");
        req.session.currentUser = req.body.username;
        utils.sendSuccessResponse(res, { user : req.body.username });
    }).catch(function(error) {
        res.status(400);
        res.end('error');
        utils.sendErrResponse(res, 403, 'Username or password invalid.');
    });
    //console.log(p1);
    //console.log(p2);
    //console.log("exit");
});

/* GET profile page. */
router.get('/profile', function(req, res) {

    userModel.getSongs(req.session.currentUser).then(function(user) { // alice don't delete me
        res.render('userProfile', { currentUser: 'Aliceeee',
                               songs:[{title:"Frozen", artist:"girl"},
                                    {title:"Wildest Dreams", artist:"T Swizzle"}] });
    });
});

router.get('/gathering', function(req, res){
    res.render('gathering', {gatheringName:"gatheringName", host:"hostName", 
                             nextSong:{title:"nexttitle", artist:"nextartist"}, 
                            queuedSongs:[{title:"title1", artist:"artist1"}, 
                                        {title:"title2", artist:"artist2"}]});
});

router.get('/joinGathering', function(req, res){
    res.render('joinGathering');
});

router.get('/createGathering', function(req, res){
    res.render('createGathering', {shoutkey:"watermelon"});
})

router.get('/songs', function(req, res){
    console.log('songstring' + req.query.content);
   spotifyUtils.sendMatches(res, req.query.content);
});

/* POST add song to list */
router.post('/song', function(req, res) {
    console.log('post to songs');
    console.log('body content' + req.body.content);
    console.log('currentUser' + req.session.currentUser);
    userModel.addSong(req.session.currentUser, req.body.content);
});

/* DELETE delete song from list */
router.delete('/song', function(req, res) {
    userModel.removeSong(req.session.currentUser, req.body.song);
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
