(function() {

	$(document).on('click', '#mygathering-btn', function(evt) {
		window.location = '/gathering';
	});

	$(document).on('click', '#join-btn', function(evt) {
		window.location = '/joinGathering';
	});

	$(document).on('click', '#gatherings-btn', function(evt) {
		window.location = '/createGathering';
	});

	$(document).on('click', '#creategathering-btn', function(evt) {
		evt.preventDefault();
		$.post(
			'/gatherings',
			{name : helpers.getFormData(this).name,
			 shoutkey : $("#gatheringName").html()} 
		).done(function(response) {
			window.location = '/gathering';
			myGathering = $("#gatheringName").html();
		}).fail(function(responseObject) {
			var response = $.parseJSON(responseObject.responseText);
            $('.error').text(response.err);
		});
	});

	$(document).on('click', '#joingathering-btn', function(evt) {
		var shoutkey = helpers.getFormData(this).shoutkey;
		window.location = '/gathering/' + shoutkey;
		myGathering = shoutkey;
	});

	$(document).on('click', '#delete-gathering', function(evt) {
		  var gathering = $(this).parent();
		  var shoutkey = gathering.data('shoutkey');
		  $.delete({
			'/gathering/' + shoutkey
		  }).done(function(response) {
			  window.location = '/homepage';
			  myGathering = undefined;
		  }).fail(function(responseObject) {	
			  var response = $.parseJSON(responseObject.responseText);
			  $('.error').text(response.err);
		  });
	  });

	$(document).on('click', '#members-btn', function(evt) {
		$.get(
			'/gathering'
		).done(function(response) {
			window.location = '/members';
		}).fail(function(responseObject) {
			var response = $.parseJSON(responseObject.responseText);
			$('.error').text(response.err);
		});
	});

})();