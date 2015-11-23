// Currently sending errors to error.ejs, so ideally
// error should take currentUser + ?responseObject
// and determine the appropriate error response - 
// namely, "no user logged in" if currentUser is 
// undefined, else the error specified by responseObject

////TODO: Change instances of "gatheringInfo" to match actual server data
(function() {

	var loadGatheringsPage = function() {
		$.get('/gatherings'
		).done(function(response) {
			loadPage('myGatherings', { gatherings: response.content.gatherings, currentUser: currentUser })
		}).fail(function(responseObject) {
			loadPage('error', {currentUser : currentUser, error : responseObject}); 
		});
		//TODO: complete myGatherings.ejs
	};
		
	var loadJoinGatheringPage = function() {
		if(currentUser)
		{
			loadPage('joinGathering', {currentUser : currentUser});
		}
		else
		{
			loadPage('error', {currentUser : currentUser});
		}
		//TODO: complete joinGathering.ejs
	};

	var loadCreateGatheringPage = function() {
		$.get('/gathering'
		).done(function(response) {
			loadPage('createGathering', { shoutkey: response.content.shoutkey, currentUser: currentUser });	
		}).fail(function(responseObject) {
				loadPage('error', {currentUser : currentUser, error : responseObject}); 
		});
		//TODO: complete createGathering.ejs
	};

	$(document).on('click', '#gatherings-btn', function(evt) {
		loadGatheringsPage();
	});

	$(document).on('click', '#join-btn', function(evt) {
		loadJoinGatheringPage();
	});

	$(document).on('click', '#gatherings-btn', function(evt) {
		loadCreateGatheringPage();
	});

	$(document).on('click', '#creategathering-btn', function(evt) {
		evt.preventDefault();
		$.post(
			'/gatherings',
			helpers.getFormData(this) //should return name, shoutkey
		).done(function(response) {
			loadGatheringsPage();
		}).fail(function(responseObject) {
			loadPage('error', {currentUser : currentUser, error : responseObject}); 
		});
	});

	$(document).on('click', '#joingathering-btn', function(evt) {
		evt.preventDefault();
		var shoutkey = helpers.getFormData(this).shoutkey;
		$.ajax({
			  url: '/gathering/' + shoutkey,
			  type: 'GET'
		  }).done(function(response) {
			loadPage('gathering', {gatheringInfo : response.content.gatheringInfo}) //TODO : fill in
		}).fail(function(responseObject) {
			loadPage('error', {currentUser : currentUser, error : responseObject}); 
		});
	});


	$(document).on('click', '.enter-gathering', function(evt) {
		var gathering = $(this).parent();
		var data = {shoutkey : gathering.data('shoutkey')};
		$.ajax({
			  url: '/gathering/' + shoutkey,
			  type: 'GET'
		  }).done(function(response) {
			loadPage('gathering', {gatheringInfo : response.content.gatheringInfo}) //TODO : fill in
		}).fail(function(responseObject) {
			loadPage('error', {currentUser : currentUser}); 
		});
	});


	$(document).on('click', '.delete-gathering', function(evt) {
		  var gathering = $(this).parent();
		  var shoutkey = gathering.data('shoutkey');
		  $.ajax({
			  url: '/gathering/' + shoutkey,
			  type: 'DELETE'
		  }).done(function(response) {
			  item.remove();
		  }).fail(function(responseObject) {
			  loadPage('error', {currentUser : currentUser, error : responseObject}); 
		  });
	  });
	  
	  
	$(document).on('click', '.playlist-btn', function(evt) {
		var gathering = $(this).parent();
		var shoutkey = {shoutkey : gathering.data('shoutkey')};
		$.get(
			'/gatherings',
			helpers.getFormData(this) 
		).done(function(response) {
			loadPage('playlist', {gatheringInfo : response.content.gatheringInfo}) //TODO : fill in
		}).fail(function(responseObject) {
			loadPage('error', {currentUser : currentUser, error : responseObject}); 
		});
		//TODO : complete playlist.ejs
	})


	$(document).on('click', '.members-btn', function(evt) {
		var gathering = $(this).parent();
		var shoutkey = {shoutkey : gathering.data('shoutkey')};
		$.get(
			'/gatherings',
			helpers.getFormData(this) 
		).done(function(response) {
			loadPage('members', {gatheringInfo : response.content.gatheringInfo}) //TODO : fill in
		}).fail(function(responseObject) {
			loadPage('error', {currentUser : currentUser, error : responseObject}); 
		});
		//TODO : complete members.ejs
	});

})();