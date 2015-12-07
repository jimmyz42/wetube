var assert = require("assert");
var userModel = require('../model/userModel.js');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test2');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("database connected");
});

// Array is the module under test.
describe('UserModel', function() {

beforeEach(function(){
    return userModel.clearAll();
});
    
describe('#registerNewUser', function(){
    it('should create a new user that doesnt already exist', function(){
        return userModel.create('alice', 'pw')
        .then(function(){
            return userModel.getUser('alice');
        }).then(function(user){
            return user.username;
        }).should.become('alice');
    });

    it('should not create a duplicate user if it already exists', function(done){
        done();
    });
});
    
}); 