(function() {

	$(document).on('click', '#mygathering-btn', function(evt) {
		window.location = '/gathering';
	});

	/*$(document).on('click', '#join-btn', function(evt) {
		window.location = '/joinGathering';
	});*/

	/*$(document).on('click', '#gatherings-btn', function(evt) {
		window.location = '/gathering';
	});*/


	$(document).on('click', '#back-main-btn', function(evt) {
    	window.location='/';
  	});
  
	$(document).on('click', '#create-gathering-btn', function(evt) {
		evt.preventDefault();
        console.log("create gathering here");
        console.log($("#gatheringName").val());
        console.log($("#key").html());
		$.post(
			'/gathering',
			{name : $("#gatheringName").val(),
			 key : $("#key").html()} 
		).done(function(response) {
            console.log('/gathering' + response);
			window.location = '/gathering' + response;
		}).fail(function(responseObject) {
            console.log(responseObject.responseText);
            console.log(responseObject);
			var response = $.parseJSON(responseObject.responseText);
            $('.error').text(response.err);
		});
	});

	$(document).on('click', '#joingathering-btn', function(evt) {
		var key = helpers.getFormData(this).key;
		window.location = '/gathering/' + key;
		myGathering = key;
	});

	/*$(document).on('click', '#delete-gathering', function(evt) {
		  var gathering = $(this).parent();
		  var key = gathering.data('key');
		  $.delete({
			'/gathering/' + key
		  }).done(function(response) {
			  window.location = '/homepage';
			  myGathering = undefined;
		  }).fail(function(responseObject) {	
			  var response = $.parseJSON(responseObject.responseText);
			  $('.error').text(response.err);
		  });
	  });
*/
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
