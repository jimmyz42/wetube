/****Authentication middleware to make sure they’re signed in***
POST /gathering - create a gathering with key as a form param
GET /gathering/{key} - GET the gathering, also join the gathering
DELETE /gathering/{key} - delete the gathering if host, else remove user from gathering with onbeforeload
(POST /gathering/boo)*/

var express = require('express');
var userModel = require('../model/userModel');
var gatheringModel = require('../model/gatheringModel');
var router = express.Router();

/* POST create gathering */
router.post('/', function(req, res, next) {
    gatheringModel.create(req.body.key, req.session.currentUser);
});

/* GET gathering creation page */
router.get('/', function(req, res, next) {
    res.render('gathering', {});
});

/* GET gathering page. */
router.get('/:key', function(req, res, next) {
    res.render('gathering', { key: req.params.key });
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


