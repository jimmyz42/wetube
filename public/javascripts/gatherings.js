(function() {

    $(document).on('click', '#create-gathering-link', function(evt) {
		window.location = '/gathering';
	});
    
    $(document).on('click', '#mygathering-link', function(evt) {
		$.get(
              '/mygathering'
          ).done(function(response) {
            var gatheringKey = response.content.key;
            window.location = '/gathering/' + gatheringKey;
          }).fail(function(responseObject) {
              var response = $.parseJSON(responseObject.responseText);
              $('.error').text(response.err);
          });
	});
	
	$(document).on('click', '#mygathering-btn', function(evt) {
		$.get(
              '/mygathering'
          ).done(function(response) {
            var gatheringKey = response.content.key;
            window.location = '/gathering/' + gatheringKey;
          }).fail(function(responseObject) {
              var response = $.parseJSON(responseObject.responseText);
              $('.error').text(response.err);
          });
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

  	$(document).on('click', '#findgathering-btn', function(evt) {
    	window.location='/findgathering';
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
	
			if(response.content.created)
			{

				console.log('/gathering/' + response.content.key);
				window.location = '/gathering/' + response.content.key;
				window.location = '/gathering/' + response.content.key;
			}
			else
			{
				alert('Before creating a gathering, pick some songs you like!');
			}
		}).fail(function(responseObject) {
            console.log(responseObject.responseText);
            console.log(responseObject);
			var response = $.parseJSON(responseObject.responseText);
            $('.error').text(response.err);
		});
	});

	$(document).on('click', '#joingathering-btn', function(evt) {
		var key = $("#key").val();
		window.location = '/gathering/' + key;
		myGathering = key;
	});

	$(document).on('click', '#end-gathering-btn', function(evt) {
        $.ajax({
          url: window.location.pathname,
          type: 'DELETE'
        }).done(function(response) {
            console.log('done deleting gathering');
			  window.location = '/';
			  myGathering = undefined;
		  }).fail(function(responseObject) {	
			  var response = $.parseJSON(responseObject.responseText);
			  $('.error').text(response.err);
		  });
	  });

	$(document).on('click', '#members-btn', function(evt) {
		window.location = '/members';
		/*
		$.get(
			'/mygathering'
		).done(function(response) {
			window.location = '/members';
		}).fail(function(responseObject) {
			var response = $.parseJSON(responseObject.responseText);
			$('.error').text(response.err);
		});
		*/
	});

	
        

})();
