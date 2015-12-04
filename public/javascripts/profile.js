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
                $("#search-results").append("<h3>Choose which song you want: (Click on the link to hear a preview.)</h3>");
                for (var index=0; index<Math.min(matches.length, 5); index++){
                    console.log(matches[index]);
                        
                    var button = $("<button/>", {id: matches[index].id, 
                                                 class:'add-button btn btn-default',
                                                text: 'Add Song', 
                                                click: createAddSongFunction(matches[index].id)});
            
                    var link = $("<a/>", {href: matches[index].previewUrl,
                                          class:"song-link",
                                          target:"_blank",
                                         text: matches[index].title});
                    $("#search-results").append(button);
                    $("#search-results").append(link);
                    $("#search-results").append("Artist(s): " + matches[index].artists);
                    $("#search-results").append("<br>");

                };
            }
            $('#searchModal').modal();
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
                $("#search-results").append("<h3>Choose which artist you want: </h3>");
                for (var index=0; index<Math.min(matches.length, 5); index++){
                    console.log(matches[index]);
                    var holderdiv = $("<div/>", {class:"search-results-div"});
                    var button = $("<button/>", {id: matches[index].id, 
                                                text: 'Add Artist',
                                                 class:'add-button btn btn-default',
                                                click: createAddArtistFunction(matches[index].id)});
            
                    var link = $("<img/>", {src: matches[index].imageUrl, class:"artistImage song-link"});
                 /*   $("#search-results").append(button);
                    $("#search-results").append("  " + matches[index].name);
                    $("#search-results").append(link);
                    $("#search-results").append("<br>");*/
                    $("#search-results").append(holderdiv);
                    holderdiv.append(link);
                    holderdiv.append(button);
                    holderdiv.append("  " + matches[index].name);
                }
            }
            $('#searchModal').modal();
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
