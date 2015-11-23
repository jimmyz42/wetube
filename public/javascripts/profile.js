//Support more detailed profile editing (name, picture, etc.) for final?

(function() {

	var loadProfilePage = function() {
		$.get('/profile'
		).done(function(response) {
			loadPage('userProfile', { songs: response.content.songs, currentUser: currentUser })
		}).fail(function(responseObject) {
			var error = $.parseJSON(responseObject.responseText);
			loadPage('error', {currentUser : currentUser, error : error});
		});
	};
    
    var createAddSongFunction = function(id){
        var clickFunction  = function(){
            alert(id);
            $.post(
                '/song',
                { content: id }
            ).done(function(response) {
                $("#likedSongs").append("<p>" + id + "<p>");
				var response = $.parseJSON(responseObject.responseText);
            }).fail(function(responseObject) {
				$('.error').text(response.err);
            });
        };
        return clickFunction;
    };
	
	$(document).on('click', '#profile-btn', function(evt) {
		window.location='/profile';
	});
	
	
	 $(document).on('click', '#search-song-btn', function(evt) {
          evt.preventDefault();
         $("#search-results").empty();
            searchString = $("#search-song-input").val();
            console.log("SEARCH STRING" + searchString);
          $.get(
              '/songs',
              {content:searchString}
          ).done(function(response) {
            var matches = response.content.songs;
            if (matches.length===0){
                $("#search-results").append("<p>Sorry, no matches found!</p>");
            }
            else{
                $("#search-results").append("<h2>Choose which song you want: (Click on the link to hear a preview.)</h2>");
                for (var index=0; index<Math.min(matches.length, 5); index++){
                    console.log(matches[index]);
                        
                    var button = $("<button/>", {id: matches[index].id, 
                                                text: 'Add Song', 
                                                click: createAddSongFunction(matches[index].id)});
            
                    var link = $("<a/>", {href: matches[index].previewUrl,
                                          target:"_blank",
                                         text: matches[index].name});
                    $("#search-results").append(button);
                    $("#search-results").append(link);
                    $("#search-results").append("<p> Artist(s): " + matches[index].artists + "</p>");
                };
            }
          }).fail(function(responseObject) {
              var response = $.parseJSON(responseObject.responseText);
              $('.error').text(response.err);
          });
    });

	$(document).on('click', '.remove-song', function(evt) {
	  var song = $(this).parent().data('id');
	  $.delete(
		'/song',
		{song : song}
		).done(function(response) {
			loadPage('userProfile', { songs: response.content.songs, currentUser: currentUser })
		}).fail(function(responseObject) {
			var response = $.parseJSON(responseObject.responseText);
			$('.error').text(response.err);
		});
	});

})();
