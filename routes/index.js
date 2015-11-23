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
var router = express.Router();
var utils = require('../utils/utils');
var spotifyUtils = require('../utils/spotifyUtils');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'WeTube' });
});

/* GET login page. */
router.get('/login', function(req, res) {
  res.render('login', { title: 'Express' });
});

/* GET register page. */
router.get('/register', function(req, res) {
  res.render('register', { title: 'Express' });
});

/* GET profile page. */
router.get('/profile', function(req, res) {
  res.render('userProfile', { title: 'Express' });
});

/*GET /songs*/
router.get('/song', function(req, res){
  //  spotifyUtils.sendMatches(res, "Radioactive");
    spotifyUtils.sendSongInfo(res, "7ED2Ow3trsqXrfDxr87OBD");
});

/*
  Require authentication on ALL access to /gathering/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
 /* if (!req.session.currentUser) {
    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    next();
  }*/
};

router.use('/songs', requireAuthentication);
router.use('/profile', requireAuthentication);

module.exports = router;
