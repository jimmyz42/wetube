//TODO : Am I using EJS correctly?
//currently using ejs.render + filename, data to generate html string
// Also: I think login.ejs is obsolete

var ejs = require('ejs');

currentUser = undefined;

var loadPage = function(template, data) {
	data = data || {};
	$('#main-container').html(ejs.render(template, data));
};

var loadHomePage = function() {
	if (currentUser) {
		loadPage('homepage', {currentUser : currentUser});
		//TODO: complete homepage.ejs
	} else {
		loadPage('index');
	}
};

$(document).ready(function() {
	$.get('/index/account', function(response) {
		if (response.content.loggedIn) {
			currentUser = response.content.user;
		}
		loadHomePage();
	});
});

$(document).on('click', '#home-link', function(evt) {
	evt.preventDefault();
	loadHomePage();
});

$(document).on('click', '#login-btn', function(evt) {
	loadPage('login');
});

$(document).on('click', '#register-btn', function(evt) {
	loadPage('register');
});

