////TODO: Change instances of "gatheringInfo" to match actual server data

(function() {

	var loadGatheringPage = function() {
		$.get('/mygathering'
		).done(function(response) {
			loadPage('gathering', { gathering: response.content.gathering, currentUser: currentUser })
		}).fail(function(responseObject) {
			var error = $.parseJSON(responseObject.responseText);
			loadPage('error', {currentUser : currentUser, error : error});
		});
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
	};

	var loadCreateGatheringPage = function() {
		$.get('/gathering'
		).done(function(response) {
			loadPage('createGathering', { shoutkey: response.content.shoutkey, currentUser: currentUser });	
		}).fail(function(responseObject) {
			var error = $.parseJSON(responseObject.responseText);
			loadPage('error', {currentUser : currentUser, error : error});
		});
	};

	$(document).on('click', '#mygathering-btn', function(evt) {
		loadGatheringPage();
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
			{name : helpers.getFormData(this).name,
			 shoutkey : $("#gatheringName").html()} 
		).done(function(response) {
			loadGatheringPage();
		}).fail(function(responseObject) {
			var error = $.parseJSON(responseObject.responseText);
			loadPage('error', {currentUser : currentUser, error : error});
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
			var response = $.parseJSON(responseObject.responseText);
			$('.error').text(response.err);
		});
	});

	$(document).on('click', '#delete-gathering', function(evt) {
		  var gathering = $(this).parent();
		  var shoutkey = gathering.data('shoutkey');
		  $.ajax({
			  url: '/gathering/' + shoutkey,
			  type: 'DELETE'
		  }).done(function(response) {
			  item.remove();
		  }).fail(function(responseObject) {
			  var error = $.parseJSON(responseObject.responseText);
			  loadPage('error', {currentUser : currentUser, error : error});
		  });
	  });

	$(document).on('click', '#members-btn', function(evt) {
		$.get(
			'/mygathering',
		).done(function(response) {
			loadPage('members', {gatheringInfo : response.content.gatheringInfo}) //TODO : fill in
		}).fail(function(responseObject) {
			var error = $.parseJSON(responseObject.responseText);
			loadPage('error', {currentUser : currentUser, error : error});
		});
	});

})();