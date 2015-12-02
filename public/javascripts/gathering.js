
(function() {

   /* $(document).on('click', '#testframe', function(evt) {
    	alert('test frame rectangle clicked');
  	});
    
    $("#holderdiv").bind('click', function(evt){
        alert('holder div clicked') 
    });
*/
    window.onbeforeunload  = function(evt) {
        if (!($("#end-gathering-btn").length)){
            alert('deleting');
             $.ajax({
                url: window.location.pathname,
                type: 'DELETE'
            }).done(function(response) {
                console.log('done deleting gathering');
                myGathering = undefined;
                return "You've left the gathering";
            }).fail(function(responseObject) {	
                var response = $.parseJSON(responseObject.responseText);
                return response.err;
            });
        };
  	};
    
})();

