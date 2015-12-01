
(function() {

  /*  $(document).on('click', '.testbutton', function(evt) {
    	alert($("#songLength").html());
  	});
    
    $(document).on('click', '#testframe', function(evt) {
    	alert('test frame rectangle clicked');
  	});
    
    $("#holderdiv").bind('click', function(evt){
        alert('holder div clicked') 
    });*/

    $( document ).ready(function() {
        var time = parseInt($("#songLength").html());
        setTimeout(function(){ 
            location.reload(); 
        }, parseInt($("#songLength").html()));
    }); 
    
})();

