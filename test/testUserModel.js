var assert = require("assert");
var TweetModel = require('../model/userModel.js');
var chai = require("chai"); // chai is a peer dependency of chai-as-promised
var chaip = require("chai-as-promised")

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test2');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("database connected");
});

// Array is the module under test.
describe('UserModel', function() {

/*beforeEach(function(done){
//Do stuff before each thing
  done()
});*/
    
describe('#registerNewUser', function(){
    it('should create a new user that doesnt already exist', function(done){
        assert.equal(true, true);
        done();
    });

    it('should not create a duplicate user if it already exists', function(done){
        done();
    });
});
    
}); 