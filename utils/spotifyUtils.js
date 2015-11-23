var SpotifyWebApi = require('spotify-web-api-node');
var utils = require('./utils');

var spotifyUtils = (function () {

    var _spotifyUtils = {};

    var spotifyApi = new SpotifyWebApi({
      redirectUri : 'http://www.spotify.com'
    });
    
    /*
    Searches for songs whose names match the searchString. 
    Returns an array of potential matches. Each potential match is a javascript object with 
    properties name, artist, popularity, previewUrl, and id. 
    Currently returns the top 20 matches. We can trim this down if wanted. Also sorts by popularity.
    
    Usage: 
    
    In the router--
    spotifyUtils.sendMatches(res, "Radioactive");
    
    In the frontend javascript--
    $.get('...', function(response) {
        var matches = response.content.songs;
        for (var index=0; index<matches.length; index++){
            console.log(matches[index]);
        };
	});
    */

     _spotifyUtils.sendMatches = function(res, searchString){
        spotifyApi.searchTracks(searchString)
        .then(function(data){
    
            var firstPage = data.body.tracks.items;
            console.log('The tracks in the first page are.. (popularity in parentheses)');
            console.log(firstPage.length);
            matchedSongs = [];
            for (var i=0; i<firstPage.length; i++){
                track = firstPage[i];
                console.log(i + ': ' + track.name + ' (' + track.popularity + ')');

                trackArtists = [];
                for (var j=0; j<track.artists.length;j++){
                    trackArtists.push(track.artists[j].name);
                };
                console.log(trackArtists);
                songInfo = {
                    name: track.name, 
                    popularity:track.popularity, 
                    previewUrl:track.preview_url,
                    id:track.id,
                    artists:trackArtists
                };
                console.log(songInfo);
                for (property in songInfo){
                    console.log(property + ": " + songInfo[property]);
                };
                matchedSongs.push(songInfo);
            };
            
            matchedSongs.sort(function(song1, song2){
                return song2.popularity - song1.popularity;
            });
            utils.sendSuccessResponse(res, { songs : matchedSongs });
        }, function(err){
            console.log('error finding matches');
            utils.sendErrResponse('Error in finding matches');
        });
    };
    
    /*
    Precondition: songID is a valid spotify song ID
    Sends information about the song with the spotify songID given. 
    Returns an object with properties name, popularity, previewUrl, id, artists, and epxlicit
    
    Usage:
    In the backend--
    spotifyUtils.sendSongInfo(res, "7ED2Ow3trsqXrfDxr87OBD");
    
    In the frontend javascript--
    $.get(..., function(response) {
        console.log(response.content.songInfo);
	});
    */
     _spotifyUtils.sendSongInfo = function(res, songID){
        spotifyApi.getTrack(songID)
        .then(function(data){
            var track=data.body;
            console.log(track);
            trackArtists = [];
            for (var j=0; j<track.artists.length;j++){
                trackArtists.push(track.artists[j].name);
            };
            console.log(trackArtists);
            songInfo = {
                name: track.name, 
                popularity:track.popularity, 
                previewUrl:track.preview_url,
                id:track.id,
                artists:trackArtists,
                //For now, not using explicit, but it could come in handy later
      //          explicit:track.explicit
            };
            utils.sendSuccessResponse(res, { songInfo: songInfo });
        }, function(err){
            console.log('error finding song');
            utils.sendErrResponse('Error in finding song');
        });
    };

    Object.freeze(_spotifyUtils);
    return _spotifyUtils;

})();

module.exports = spotifyUtils;
