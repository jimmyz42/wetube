(function() {

    /**
    Brings the user to the page to create a new gathering
    **/
    $(document).on('click', '#create-gathering-link', function(evt) {
		window.location = '/gathering';
	});
    
    /**
    Brings the user to the page of the gathering they are currently a host of
    **/
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
	
 /*   
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
	});*/

    //Post to send emails to the emails inputted
    $(document).on('click', '#gathering-invite', function(evt) {
        if ($('input[name="invitee"]').val()===''){
            alert('Please enter some emails');
            return;
        }
        $.post('/email', {
            email: $('input[name="invitee"]').val(),
            key: $('input[name="key"]').val()
        }).done(function(response) {
            alert('Your friends should receive an email shortly');
            $('input[name="invitee"]').val('');
        }).fail(function(err) {
            console.log(err);
        });
    });

    //Go back to main page
	$(document).on('click', '#back-main-btn', function(evt) {
    	window.location='/';
  	});

 /*   //Go to join gathering page
  	$(document).on('click', '#findgathering-btn', function(evt) {
    	window.location='/findgathering';
  	});*/
  
    //Post to create a new gathering with the key inputted
	$(document).on('submit', '#create-gathering-form', function(evt) {
		evt.preventDefault();
        console.log("create gathering here");
        console.log($("#gatheringName").val());
        console.log($("#key").val());
		$.post(
			'/gathering',
			{name : $("#gatheringName").val(),
			 key : $("#key").val()} 
		).done(function(response) {
			if(response.content.created)
			{
				console.log('/gathering/' + response.content.key);
				window.location = '/gathering/' + response.content.key;
				window.location = '/gathering/' + response.content.key;
			}
			else
			{
				if(response.content.keyFree)
				{
					alert('Before creating a gathering, pick some songs you like!');
				}
				else
				{
					alert('Sorry! That key is in use. Please choose a different one.');
				}		
			}
		}).fail(function(responseObject) {
            console.log(responseObject.responseText);
            console.log(responseObject);
			var response = $.parseJSON(responseObject.responseText);
            $('.error').text(response.err);
		});
	});

    //Join the gatheirng of the key inputted
	$(document).on('click', '#joingathering-btn', function(evt) {
		var key = $("#key").val();
        myGathering = key;
		window.location = '/gathering/' + key;
	});

    //Assumes this is the host (since only host will have this button)
    //Deletes the gathering
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

    //Opens the modal that shows the members
	$(document).on('click', '#members-btn', function(evt) {
        $('#membersModal').modal();
        //window.location = '/members';
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
    
    //Chooses new songs
    $(document).on('click', '#rechoose-songs-btn', function(evt) {
		location.reload();
	});        

})();
