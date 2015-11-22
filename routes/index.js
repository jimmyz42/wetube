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
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'WeTube' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Express' });
});

/* POST login */
router.post('/login', function(req, res, next) {
    userModel.verify(req.body.username, req.body.password)
    .then(function() {
        req.session.currentUser = req.body.username;
        res.end('success');
    }).catch(function(error) {
        res.status(401);
        res.end(error);
    });
});

/* GET account creation page. */
router.get('/account', function(req, res, next) {
    res.render('register', { title: 'Express' });
});

/* POST create account */
router.post('/account', function(req, res, next) {
    userModel.create(req.body.username, req.body.password)
    .then(function() {
        req.session.currentUser = req.body.username;
        res.end('success');
    }).catch(function(error) {
        res.status(400);
        res.end(error);
    });
});

/* GET profile page. */
router.get('/profile', function(req, res, next) {
    res.render('userProfile', { title: 'Express' });
});

/* POST add song to list */
router.post('/song', function(req, res, next) {
    userModel.addSong(req.session.currentUser, req.body.song);
});

/* DELETE delete song from list */
router.delete('/song', function(req, res, next) {
    userModel.removeSong(req.session.currentUser, req.body.song);
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

// a middleware sub-stack shows request info for any type of HTTP request to /user/:id
router.use('/songs', requireAuthentication);
router.use('/profile', requireAuthentication);

module.exports = router;
