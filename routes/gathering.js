/****Authentication middleware to make sure they’re signed in***
POST /gathering - create a gathering with key as a form param
GET /gathering/{key} - GET the gathering, also join the gathering
DELETE /gathering/{key} - delete the gathering if host, else remove user from gathering with onbeforeload
(POST /gathering/boo)*/

var express = require('express');
var router = express.Router();

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


