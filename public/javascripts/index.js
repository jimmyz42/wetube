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

/*$(document).on('click', '#register-btn', function(evt) {
	window.location = '/register';
});*/

