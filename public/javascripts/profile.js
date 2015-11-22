//Support more detailed profile editing (name, picture, etc.) for final?
//TODO: Fill in add/remove song after Spotify API

(function() {

	var loadProfilePage = function() {
		$.get('/index/profile'
		).done(function(response) {
			loadPage('userProfile', { songs: response.content.songs, currentUser: currentUser })
		}).fail(function(responseObject) {
			loadPage('error', {currentUser : currentUser, error : responseObject});
		});
	};
	
	$(document).on('click', '#profile-btn', function(evt) {
		loadProfilePage();
	});
	
	
	
	
	$(document).on('click', '.add-song', function(evt) {
	  // post to index/song
	  // on done, load profile page
	  // on error, load error.ejs
	});

	$(document).on('click', '.remove-song', function(evt) {
	  // delete to index/song
	  // on done, load profile page
	  // on error, load error.ejs
	});

})();
