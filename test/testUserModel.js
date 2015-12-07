var assert = require("assert");
var userModel = require('../model/userModel.js');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var expect = require('chai').expect;
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
    
var assertArrayDeepEqual = function(expected, result){
    assert.equal(expected.length, result.length);
    for (var i=0; i<expected.length; i++){
        assert.equal(expected[i], result[i])
    }
};

var assertObjectDeepEqual = function(expected, result){
    for (var property in expected) {
        assert.ok(result[property]);
        if (result[property]){
            assert.equal(expected[property], result[property]);
        }
    }
    for (var property in result) {
        assert.ok(expected[property]);
    }
}

describe('#registerNewUser', function(){
    it('should create a new user that doesnt already exist', function(){
        return userModel.create('alice', 'pw')
        .then(function(){
            return userModel.getUser('alice');
        }).then(function(user){
            assert.equal('alice', user.username);
            assert.equal('pw', user.password);
        });
    });
    
    it('should not create a new user that does already exist', function(){
        return userModel.create('alice', 'pw')
        .then(function(){
            return userModel.create('alice', 'newpw');
        }).should.be.rejected;
    });
});
    
describe('#verifyPassword', function(){
    it('should verify a password if it matches', function(){
        return userModel.create('alice', 'pw')
        .then(function(){
            return userModel.verify('alice', 'pw');
        }).should.become('success');
    });
    
    it('should throw an error if password doesnt match', function(){
        return userModel.create('alice', 'pw')
        .then(function(){
            return userModel.verify('alice', 'pwwrong');
        }).should.be.rejected;
    });
});
    
describe('#addSong', function(){
    it('should add a song to a user with no current songs', function(){
        return userModel.create('alice', 'pw')
        .then(function(){
            return userModel.addSong('alice','98asdf654');
        }).then(function(){
            return userModel.getUser('alice');
        }).then(function(user){
            return user.songIDs;
        }).then(function(songids){
            assert.equal(1, songids.length);
            assert.equal('98asdf654', songids[0]);
        });
    });
    
    it('should add a song to a user with a few currently liked songs', function(){
        return userModel.create('alice', 'pw')
        .then(function(){
            return userModel.addSong('alice', 'songid1');
        }).then(function(){
            return userModel.addSong('alice','songid2');
        }).then(function(){
            return userModel.addSong('alice','songid3');
        }).then(function(){
            return userModel.getUser('alice');
        }).then(function(user){
            console.log(user.songIDs);
            return user.songIDs;
        }).then(function(songIDs){
            assert.equal(3, songIDs.length);
            assert.equal('songid1', songIDs[0]);
            assert.equal('songid2', songIDs[1]);
            assert.equal('songid3', songIDs[2]);
        });
    });
});
    
describe('#addSongs', function(){
    it('should add an array of one song to a user with no current songs', function(){
        return userModel.create('alice', 'pw')
        .then(function(){
            return userModel.addSongs('alice',['98asdf654']);
        }).then(function(){
            return userModel.getUser('alice');
        }).then(function(user){
            return user.songIDs;
        }).then(function(songids){
            assert.equal(1, songids.length);
            assert.equal('98asdf654', songids[0]);
        });
    });
    
    it('should add an array of songs to a user with a few currently liked songs', function(){
        return userModel.create('alice', 'pw')
        .then(function(){
            return userModel.addSong('alice', 'songid1');
        }).then(function(){
            return userModel.addSong('alice','songid2');
        }).then(function(){
            return userModel.addSongs('alice',['songid3', 'songid4', 'songid5']);
        }).then(function(){
            return userModel.getUser('alice');
        }).then(function(user){
            console.log(user.songIDs);
            return user.songIDs;
        }).then(function(songIDs){
            assertArrayDeepEqual(['songid1','songid2','songid3','songid4','songid5'], songIDs);
        });
    });
});
    
describe('#addArtist', function(){
    it('should add an artist for a user', function(){
        return userModel.create('alice', 'pw')
        .then(function(){
            return userModel.addArtist('alice','53XhwfbYqKCa1cC15pYq2q');
        }).then(function(){
            return userModel.getArtists('alice');
        }).then(function(artists){
            assert.equal(1, artists.length);
            assert.equal('53XhwfbYqKCa1cC15pYq2q', artists[0].id);
            assertArrayDeepEqual([ '4G8gkOterJn0Ywt6uhqbhp', '3LlAyCYU26dvFZBDUIMb7a',
                                   '15DrrIod12Tc2IoMaHiwlQ','4XLm8FNvaTlmTAZmSrrV82',
                                    '4GITtbZtRCQXhWLMXrWXHt', '1lgN0A2Vki2FTON5PYq42m',
                                    '64MmobYNviePoiaINMrbMn','6KuHjfXHkfnIjdmcIvt9r0' ], artists[0].topTracks);
        });
    });
});
    
describe('#remove Song', function(){
    it('should remove a song that the user currently likes', function(){
        return userModel.create('alice', 'pw')
        .then(function(){
            return userModel.addSong('alice','songid1');
        }).then(function(){
            return userModel.removeSong('alice', 'songid1');
        }).then(function(){
            return userModel.getSongs('alice');
        }).then(function(songids){
            assert.equal(0, songids.length);
        });
    });
    
    it('should remove a song that the user currently likes', function(){
        return userModel.create('alice', 'pw')
        .then(function(){
            return userModel.addSong('alice','songid1');
        }).then(function(){
            return userModel.removeSong('alice', 'songid2');
        }).then(function(){
            return userModel.getSongs('alice');
        }).then(function(songids){
            assert.equal(1, songids.length);
            assert.equal('songid1', songids[0]);
        });
    });
});
    
describe('#removeArtist', function() {
    it('should remove artist if it exists', function() {
        return userModel.create('bob', 'thebuilder')
        .then(function() {
            return userModel.addArtist('bob', '53XhwfbYqKCa1cC15pYq2q');
        }).then(function() {
            return userModel.removeArtist('bob', '53XhwfbYqKCa1cC15pYq2q');
        }).then(function() {
            return userModel.getArtists('bob');
        }).then(function(artists) {
            assertArrayDeepEqual([], artists);
        });
    });

    it('should not remove artist if it does not exist', function() {
        return userModel.create('bob', 'thebuilder')
        .then(function() {
            return userModel.addArtist('bob', '79hrYiudVcFyyxyJW0ipTy');
        }).then(function() {
            return userModel.removeArtist('bob', '53XhwfbYqKCa1cC15pYq2q');
        }).then(function() {
            return userModel.getArtists('bob');
        }).then(function(artists) {
            assert.equal(1, artists.length);
            assert.equal('79hrYiudVcFyyxyJW0ipTy', artists[0].id);
        });
    });
});    
    
describe('#getUser', function() {
    it('should return the correct user object', function() {
        return userModel.create('santa', 'claus')
        .then(function() {
            return userModel.getUser('santa');
        })
        .then(function(user) {
            assert.equal('santa', user.username);
            assert.equal('claus', user.password);
        });
    });
});

describe('#usernameAvailable', function() {
    it('should be true if username is available', function() {
        return userModel.usernameFree('alice').should.become(true);
    });

    it('should be false if username is taken', function() {
        return userModel.create('alice', 'pw')
        .then(function(user) {
            return userModel.usernameFree('alice');
        }).should.become(false);
    });  
});


}); 
