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

/* POST create gathering */
router.post('/', function(req, res) {
    console.log('inside router post');
    console.log(req.body.key + req.session.currentUser);
    gatheringModel.create(req.body.key, req.session.currentUser);
    console.log('created thing, about to send response');
    utils.sendSuccessResponse(res, req.body.key);
});

/* GET gathering creation page */
router.get('/', function(req, res) {
    var key = (Math.random()*1e32).toString(36);
    res.render('createGathering', { key: key });
});

/* GET gathering page, also join. */
router.get('/:key', function(req, res, next) {
    gatheringModel.join(req.params.key, req.session.currentUser).then(function() {
        return gatheringModel.get(req.params.key);
    }).then(function(gathering) {
        res.render('gathering', {gatheringName:"gatheringName", host:"hostName", key: req.params.key,
                             nextSong:{title:"nexttitle", artist:"nextartist"},
                            queuedSongs:[{title:"title1", artist:"artist1"},
                                        {title:"title2", artist:"artist2"}]});
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


