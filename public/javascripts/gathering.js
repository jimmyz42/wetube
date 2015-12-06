/**
Javascript file specifically for a gathering page. 
When a user closes the window, they are no longer part of the gathering
**/

(function() {
    window.onbeforeunload  = function(evt) {
        if (!($("#end-gathering-btn").length)){
            //This is not a host, so we remove the user from the gathering
             $.ajax({
                url: window.location.pathname,
                type: 'DELETE'
            }).done(function(response) {
                myGathering = undefined;
                return "You've left the gathering";
            }).fail(function(responseObject) {	
                var response = $.parseJSON(responseObject.responseText);
                return response.err;
            });
        };
  	};
    
})();

