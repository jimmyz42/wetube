//Support more detailed profile editing (name, picture, etc.) for final?
//TODO: Fill in add/remove song after Spotify API

(function() {

	var loadProfilePage = function() {
		$.get('/index/profile'
		).done(function(response) {
			loadPage('userProfile', { songs: response.content.songs, currentUser: currentUser })
		}).fail(function(responseObject) {
			loadPage('error', {currentUser : currentUser, error : responseObject});
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
            }).fail(function(responseObject) {
                $('.error').text("Sorry, something went wrong!");
            });
        };
        return clickFunction;
    };
	
	$(document).on('click', '#profile-btn', function(evt) {
		loadProfilePage();
	});
	
	
	 $(document).on('click', '#search-song-btn', function(evt) {
          evt.preventDefault();
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
	
	$(document).on('click', '.add-song', function(evt) {
	  // post to index/song
	  // on done, load profile page
	  // on error, load error.ejs
	});

	$(document).on('click', '.remove-song', function(evt) {
	  // delete to index/song
	  // on done, load profile page
	  // on error, load error.ejs
	});

})();