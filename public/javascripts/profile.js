//Support more detailed profile editing (name, picture, etc.) for final?

(function() {
    
    //Create the on-click function for an add-song button
    //@param id the spotify id of the song 
    //@return a function that posts a request to add the song to the user's liked songs
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
    
    //Create the on-click function for an add-artist button
    //@param id the spotify id of the artist
    //@return a function that posts a request to add the artist to the user's liked artists
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
	
    $(document).on('click', 'div.profile', function(evt) {
        $('#pictureModal').modal();
    });

    $(document).on('click', '#uploadPreview', function(evt) {
        evt.preventDefault();
        var file = $('input[name="file"]')[0].files[0];
        $('#profilePreview').attr('src', URL.createObjectURL(file));
    });

    //Upload image to the profile picture
    $(document).on('click', '#uploadSubmit', function(evt) {
        evt.preventDefault();
        var file = $('input[name="file"]')[0].files[0];
        var formdata = new FormData();
        if(file.type.startsWith('image')) {
            formdata.append('file', file, file.name);
            $.ajax({
                url: '/upload',
                type: 'POST',
                data: formdata,
                processData: false,
                contentType: false
            }).done(function(data) {
                location.reload();
            }).fail(function(err) {
                //display error
            });
        }
    });
	
    //Search for a song using spotify api, and display results with links to song preview, artists, and 
    //an image of the album art
	 $(document).on('submit', '#search-song-form', function(evt) {
          evt.preventDefault();
         $('#song-error').text('');
         $('#artist-error').text('');
         $("#search-results").empty();
         $('#search-artist-input').val('');
            searchString = $("#search-song-input").val();
            if(searchString.length === 0) {
                $('#song-error').text('Please enter a song name!');
                return;
            }
          $.get(
              '/songs',
              {content:searchString}
          ).done(function(response) {
            var matches = response.content.songs;
            if (matches.length===0){
                $("#search-results").append("<p>Sorry, no matches found!</p>");
            }
            else{
                var search = $('#search-results');
                search.append("<h3>Choose which song you want:</h3")
                search.append("<p>(Click on the image to hear a preview.)<p>");
                var table = $('<table/>', { class: 'search' });
                for (var index=0; index<Math.min(matches.length, 8); index++){
                    console.log(matches[index]);
                    var button = $("<button/>", {id: matches[index].id, 
                                                class:'add-button btn btn-default',
                                                text: 'Add Song', 
                                                click: createAddSongFunction(matches[index].id)});
            
                    var link = $("<a/>", {href: matches[index].previewUrl,
                                          class:"song-link",
                                          target:"_blank"});
                    var img = $("<img/>", {src: matches[index].albumArtUrl, class:"artistImage song-link"});
                    var row = $('<tr></tr>');
                    link.append(img);
                    var col1 = $('<td></td>');
                    col1.append(link);
                    var col2 = $('<td/>', { class: 'middle' });
                    col2.append("Song: " + matches[index].title + "<br>");
                    col2.append("Artist(s): " + matches[index].artists);
                    var col3 = $('<td></td>');
                    col3.append(button);
                    row.append(col1);
                    row.append(col2);
                    row.append(col3);
                    table.append(row);
                }
                search.append(table);
            }
            $('#searchModal').modal();
          }).fail(function(responseObject) {
              var response = $.parseJSON(responseObject.responseText);
              $('#song-error').text(response.err);
          });
    });
    
      //Search for an artist using spotify api, and display results with artists and 
    //an image, and a button to add that artist
     $(document).on('submit', '#search-artist-form', function(evt) {
            evt.preventDefault();
            $("#search-results").empty();
            $('#artist-error').text('');
            $("#song-error").text('');
            $('#search-song-input').val('');
            searchString = $("#search-artist-input").val();
            if(searchString.length === 0) {
                $('#artist-error').text('Please enter an artist name!');
                return;
            }
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
                var table = $('<table/>', { class: 'search' });
                for (var index=0; index<Math.min(matches.length, 5); index++){
                    console.log(matches[index]);
                    var button = $("<button/>", {id: matches[index].id, 
                                                text: 'Add Artist',
                                                 class:'add-button btn btn-default',
                                                click: createAddArtistFunction(matches[index].id)});
            
                    var link = $("<img/>", {src: matches[index].imageUrl, class:"artistImage song-link"});
                    var row = $('<tr></tr>');
                    var col1 = $('<td></td>');
                    col1.append(link);
                    var col2 = $('<td/>', { class: 'middle' });
                    col2.append("  " + matches[index].name);
                    var col3 = $('<td></td>');
                    col3.append(button);
                    row.append(col1);
                    row.append(col2);
                    row.append(col3);
                    table.append(row);
                }
                $('#search-results').append(table);
            }
            $('#searchModal').modal();
          }).fail(function(responseObject) {
              var response = $.parseJSON(responseObject.responseText);
              $('#artist-error').text(response.err);
          });
    });

    //Remove a liked song from the current user's liked list
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
    
    //Remove a liked artist from the current user's liked list
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
