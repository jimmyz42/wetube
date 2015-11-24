currentUser = undefined;
myGathering = undefined;

var loadHomePage = function() {
	if (currentUser) {
		window.location = '/homepage';
	} else {
		window.location = '/';
	}
};

/*$(document).ready(function() {
	$.get('/account', function(response) {
		if (response.content.loggedIn) {
			currentUser = response.content.user;
		}
		loadHomePage();
	});
});*/

$(document).on('click', '#home-link', function(evt) {
	window.location = '/homepage';
});

$(document).on('click', '#profile-btn', function(evt) {
		window.location='/profile';
	});

$(document).on('click', '#gatherings-btn', function(evt) {
		window.location = '/gathering';
	});

/*$(document).on('click', '#register-btn', function(evt) {
	window.location = '/register';
});*/

