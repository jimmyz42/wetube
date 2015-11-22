var loadGatheringsPage = function() {
	$.get('/gathering/gatherings'
	).done(function(response) {
		loadPage('myGatherings', { gatherings: response.content.gatherings, currentUser: currentUser })
	}).fail(function(responseObject) {
		loadPage('error'); //TODO: forced request ... better option than to load error page?
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
		loadPage('error'); // TODO: useful error?
	}
	//TODO: complete joinGathering.ejs
};

var loadCreateGatheringPage = function() {
	$.get('/gathering/gathering')
		.done(function(response) {
			loadPage('createGathering', { shoutkey: response.content.shoutkey, currentUser: currentUser });	
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
		'/gathering/gatherings',
		helpers.getFormData(this) //name, shoutkey
	).done(function(response) {
		loadGatheringsPage();
	}).fail(function(responseObject) {
		loadPage('error'); //TODO : useful error?
	});
});

$(document).on('click', '#joingathering-btn', function(evt) {
	evt.preventDefault();
	$.get(
		'/gathering/gathering',
		helpers.getFormData(this) //shoutkey
	).done(function(response) {
		loadPage('gathering', {gatheringInfo : response.content.gatheringInfo}) //TODO : fill in
	}).fail(function(responseObject) {
		loadPage('error'); //TODO : useful error?
	});
});