//Support more detailed profile editing (name, picture, etc.) for final?

(function() {
    
    var createAddSongFunction = function(id){
        var clickFunction  = function(){
            $.post(
                '/song',
                { content: id }
            ).done(function(response) {
                location.reload();
            }).fail(function(responseObject) {
				$('.error').text(response.err);
            });
        };
        return clickFunction;
    };
    
    var createAddArtistFunction = function(id){
        var clickFunction  = function(){
            $.post(
                '/artist',
                { content: id }
            ).done(function(response) {
                location.reload();
            }).fail(function(responseObject) {
				$('.error').text(response.err);
            });
        };
        return clickFunction;
    };
	
	$(document).on('click', '#profile-btn', function(evt) {
		window.location='/profile';
	});
	
  $(document).on('click', '#back-main-btn', function(evt) {
    window.location='/';
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
                                         text: matches[index].title});
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
    
     $(document).on('click', '#search-artist-btn', function(evt) {
          evt.preventDefault();
         $("#search-results").empty();
            searchString = $("#search-artist-input").val();
            console.log("SEARCH STRING" + searchString);
          $.get(
              '/artists',
              {content:searchString}
          ).done(function(response) {
            var matches = response.content.artists;
            if (matches.length===0){
                $("#search-results").append("<p>Sorry, no matches found!</p>");
            }
            else{
                $("#search-results").append("<h2>Choose which artist you want: </h2>");
                for (var index=0; index<Math.min(matches.length, 5); index++){
                    console.log(matches[index]);
                        
                    var button = $("<button/>", {id: matches[index].id, 
                                                text: 'Add Artist', 
                                                click: createAddArtistFunction(matches[index].id)});
            
                    var link = $("<img/>", {src: matches[index].imageUrl, class:"artistImage"});
                    $("#search-results").append(button);
                    $("#search-results").append(link);
                    $("#search-results").append("<p> Artist Name: " + matches[index].name + "</p>");
                };
            }
          }).fail(function(responseObject) {
              var response = $.parseJSON(responseObject.responseText);
              $('.error').text(response.err);
          });
    });

	$(document).on('click', '.remove-song', function(evt) {
	  var song = $(this).parent().data('id');
        console.log(song)
	   $.ajax({
            url: '/song',
            type: 'DELETE',
            data: {song : song},
        }).done(function(response) {
			location.reload();
		}).fail(function(responseObject) {
			var response = $.parseJSON(responseObject.responseText);
			$('.error').text(response.err);
		});
	});
    
    $(document).on('click', '.remove-artist', function(evt) {
        var artist = $(this).parent().data('id');
        console.log(artist);
        $.ajax({
            url: '/artist',
            type: 'DELETE',
            data: {artist : artist},
        }).done(function(response) {
			location.reload();
		}).fail(function(responseObject) {
			var response = $.parseJSON(responseObject.responseText);
			$('.error').text(response.err);
		});
	});

})();
