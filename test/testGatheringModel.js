var assert = require("assert");
var gatheringModel = require('../model/gatheringModel.js');
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
describe('GatheringModel', function() {

beforeEach(function(){
    return gatheringModel.clearAll();
});
    
describe('#createNewGathering', function(){
    it('should create a new gathering from a key', function(){
        return gatheringModel.create('6170', 'alice', '6.170 Gathering')
        .then(function(){
            return gatheringModel.get('6170');
        }).then(function(gathering){
            return gathering.host;
        }).should.become('alice');
    });
	
	it('should create a new gathering from a key', function(){
        return gatheringModel.create('6148', 'carol', '6.148 Gathering')
        .then(function(){
            return gatheringModel.get('6148');
        }).then(function(gathering){
            return gathering.name;
        }).should.become('6.148 Gathering');
    });
});

describe('#deleteGathering', function(){
    it('should delete an existing gathering', function(){
        return gatheringModel.create('6170', 'alice', '6.170 Gathering')
        .then(function(){
            return gatheringModel.delete('6170');
        }).should.be.fulfilled;
    });
	
	it('should delete an existing gathering', function(){
        return gatheringModel.create('6148', 'carol', '6.148 Gathering')
        .then(function(){
            return gatheringModel.delete('6148');
        }).then(function(){
			return gatheringModel.get('6148');
		}).then(function(gathering){
			return gathering;
		}).should.become(null);
    });
});

describe('#joinGathering', function(){
    it('should add a user to a gathering', function(){
        return gatheringModel.create('6170', 'alice', '6.170 Gathering')
        .then(function(){
            return gatheringModel.join('6170', 'bob');
        }).then(function(){
            return gatheringModel.get('6170');
		}).then(function(gathering){
			return gathering.users.length;
        }).should.become(2);
    });
	
	it('should not be able to create gatherings via join', function(){
        return gatheringModel.create('6170', 'alice', '6.170 Gathering')
        .then(function(){
            return gatheringModel.join('6148', 'bob');
        }).then(function(){
            return gatheringModel.get('6148');
		}).then(function(gathering){
			return gathering;
        }).should.become(null);
    });
});

describe('#leaveGathering', function(){
	it('should remove a user from a gathering', function(){
        return gatheringModel.create('6170', 'alice', '6.170 Gathering')
        .then(function(){
            return gatheringModel.join('6170', 'bob');
        }).then(function(){
            return gatheringModel.leave('6170', 'alice');
		}).then(function(){
			return gatheringModel.get('6170');
        }).then(function(gathering){
			return gathering.users.length;
		}).should.become(1);
    });
	
	it('should remove a user from a gathering', function(){
		return gatheringModel.create('6148', 'carol', '6.148 Gathering')
		.then(function(){
			return gatheringModel.leave('6148', 'carol');
		}).then(function(){
			return gatheringModel.get('6148');
		}).then(function(gathering){
			return gathering.users.length;
		}).should.become(0);
    });
	
});

describe('#songQueueOperations', function(){
	it('should push a song onto the queue', function(){
        return gatheringModel.create('6170', 'alice', '6.170 Gathering')
        .then(function(){
            return gatheringModel.pushSong('6170', '12345');
        }).then(function(){
            return gatheringModel.get('6170');
		}).then(function(gathering){
			return gathering.songQueue.length;
		}).should.become(1);
    });
	
	it('should recover the first pushed song with a pop', function(){
        return gatheringModel.create('6148', 'carol', '6.148 Gathering')
        .then(function(){
            return gatheringModel.pushSong('6148', '00000');
        }).then(function(){
            return gatheringModel.pushSong('6148', '00001');
        }).then(function(){
            return gatheringModel.popSong('6148');
		}).then(function(){
			return gatheringModel.get('6148');
		}).then(function(gathering){
			return gathering.songQueue[0];
		}).should.become('00001');
    });
	
	it('should clear the song queue', function(){
        return gatheringModel.create('6170', 'alice', '6.170 Gathering')
        .then(function(){
            return gatheringModel.pushSong('6170', '99999');
        }).then(function(){
            return gatheringModel.pushSong('6170', '11111');
        }).then(function(){
            return gatheringModel.clearQueue('6170');
		}).then(function(){
			return gatheringModel.get('6170');
		}).then(function(gathering){
			return gathering.songQueue.length;
		}).should.become(0);
    });
	
});

describe('#getHostGathering', function(){
    it('should get a gathering given a host name', function(){
        return gatheringModel.create('6170', 'alice', '6.170 Gathering')
        .then(function(){
            return gatheringModel.join('6170', 'bob');
        }).then(function(){
            return gatheringModel.getHostGathering('alice');
		}).then(function(gathering){
			return gathering.name;
        }).should.become('6.170 Gathering');
    });
	
	it('should not produce a gathering given the name of a non-host', function(){
        return gatheringModel.create('6148', 'carol', '6.148 Gathering')
        .then(function(){
            return gatheringModel.join('6148', 'dave');
        }).then(function(){
            return gatheringModel.getHostGathering('dave');
		}).then(function(gathering){
			return gathering;
        }).should.become(null);
	});
});

describe('#getHostGathering', function(){
    it('should get a gathering given a user', function(){
        return gatheringModel.create('6170', 'alice', '6.170 Gathering')
        .then(function(){
            return gatheringModel.join('6170', 'bob');
        }).then(function(){
            return gatheringModel.getGathering('alice');
		}).then(function(gathering){
			return gathering.name;
        }).should.become('6.170 Gathering');
    });
	
	it('should return gathering even if user is non-host', function(){
        return gatheringModel.create('6148', 'carol', '6.148 Gathering')
        .then(function(){
            return gatheringModel.join('6148', 'dave');
        }).then(function(){
            return gatheringModel.getGathering('dave');
		}).then(function(gathering){
			return gathering.name;
        }).should.become('6.148 Gathering');
	});
});

describe('#keyFree', function(){
    it('should allow use of an unused key', function(){
        return gatheringModel.create('6170', 'alice', '6.170 Gathering')
        .then(function(){
            return gatheringModel.join('6170', 'bob');
        }).then(function(){
            return gatheringModel.keyFree('6148');
		}).should.become(true);
    });
	
	it('should flag a used key', function(){
        return gatheringModel.create('6148', 'carol', '6.148 Gathering')
        .then(function(){
            return gatheringModel.keyFree('6148');
		}).should.become(false);
    });
});
    
}); 