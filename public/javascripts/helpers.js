// Packaged helper methods.
//
// Here, just one which takes the content of an HTML 
// form (passed in as an argument) and converts the 
// data to a set of key-value pairs for use in AJAX 
// calls.
var helpers = (function() {

	var _helpers = {};

	_helpers.getFormData = function(form) {
		var inputs = {};
		$(form).serializeArray().forEach(function(item) {
			inputs[item.name] = item.value;
		});
		return inputs;
	};

	Object.freeze(_helpers);
	return _helpers;

})();

$(document).on('click', '#testStuff', function(evt) {
    alert("clicked on test Stuff");
    $.get('/song', function(response) {
        alert(response.content.songs);
        var matches = response.content.songs;
    /*    for (var index=0; index<matches.length; index++){
            console.log(matches[index]);
        };*/
        console.log(response.content.songInfo);
	});
});
