currentUser = undefined;
myGathering = undefined;

//Go to my profile
$(document).on('click', '#profile-btn', function(evt) {
		window.location='/profile';
	});

//Go to find gathering
$(document).on('click', '#findgathering-btn', function(evt) {
    	window.location='/findgathering';
  	});

  
$(document).on('click', '#back-main-btn', function(evt) {
    window.location='/';
});


