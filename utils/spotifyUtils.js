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
            matchedSongs = [];
            for (var i=0; i<firstPage.length; i++){
                track = firstPage[i];
                console.log(i + ': ' + track.title + ' (' + track.popularity + ')');

                trackArtists = [];
                for (var j=0; j<track.artists.length;j++){
                    trackArtists.push(track.artists[j].name);
                };
                console.log(trackArtists);
                songInfo = {
                    title: track.name, 
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
    Searches for artists whose names match the searchString. 
    Returns an array of potential matches. Each potential match is a javascript object with 
    properties name, popularity, and id. 
    Currently returns the top 20 matches. We can trim this down if wanted. Also sorts by popularity.
    
    Usage: 
    
    In the router--
    spotifyUtils.sendArtistMatches(res, "Imagine Dragons");
    
    In the frontend javascript--
    $.get('...', function(response) {
        var matches = response.content.songs;
        for (var index=0; index<matches.length; index++){
            console.log(matches[index]);
        };
	});
    */
    _spotifyUtils.sendArtistMatches = function(res, searchString){
        spotifyApi.searchArtists(searchString, {limit: 10, offset: 0})
        .then(function(data) {
            var firstPage = data.body.artists.items;
            matchedArtists = [];
            for (var i=0; i<firstPage.length; i++){
                artist = firstPage[i];
                console.log(i + ': ' + artist.name + ' (' + artist.popularity + ')');
                if (artist.images.length > 0){
                    var imageUrl = artist.images[artist.images.length-1].url;
                }
                else{
                    var imageUrl = "/images/defaultArtist.png";
                }
                artistInfo = {
                    name: artist.name, 
                    popularity:artist.popularity, 
                    id:artist.id,
                    imageUrl:imageUrl
                };
                console.log(artistInfo);
                for (property in artistInfo){
                    console.log(property + ": " + artistInfo[property]);
                };
                matchedArtists.push(artistInfo);
            };
            
            matchedArtists.sort(function(artist1, artist2){
                return artist2.popularity - artist1.popularity;
            });
            utils.sendSuccessResponse(res, { artists : matchedArtists });
        }, function(err) {
            console.error(err);
        });
    };
    
    /*
    Precondition: songID is a valid spotify song ID
    Sends information about the song with the spotify songID given. 
    Returns an object with properties title, popularity, previewUrl, id, artists, and epxlicit
    
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
                title: track.name, 
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
    
    _spotifyUtils.getSongInfo = function(songID){
            console.log('getting song info');
            return spotifyApi.getTrack(songID)
            .then(function(data){
                var track=data.body;
                trackArtists = "";
                for (var j=0; j<track.artists.length;j++){
                    trackArtists = trackArtists + track.artists[j].name + " ";
                };
                var albumArtUrl = "/images/defaultArtist.png";
                if (track.album.images.length > 0){
                    albumArtUrl = track.album.images[track.album.images.length-1].url;
                }
                console.log('albumArtUrl' + albumArtUrl);
                songInfo = {
                    title: track.name, 
                    previewUrl:track.preview_url,
                    id:track.id,
                    artists:trackArtists,
                    albumArtUrl:albumArtUrl
                };
                return songInfo;
            });
    };
    
    /**artistObj is an object with property id and property topTracks **/
    _spotifyUtils.getArtistInfo = function(artistObj){
        console.log('getting song info');
        var artistID = artistObj.id;
        return spotifyApi.getArtist(artistID)
        .then(function(data){
            var artist=data.body;
            if (artist.images.length > 0){
                    var imageUrl = artist.images[artist.images.length-1].url;
            }
            else{
                var imageUrl = "/images/defaultArtist.png";
            }
            var songInfo = {
                name: artist.name, 
                imageUrl:imageUrl,
                id:artist.id,
            };
            return songInfo;
        });
    };

    /**
    Returns a promise of the ids of top 8 songs by an artist
    **/
    _spotifyUtils.getTopTracksForArtist = function(artistid){
        // Get an artist's top tracks
        return spotifyApi.getArtistTopTracks(artistid, 'US')
        .then(function(data) {
            var trackInfos = [];
            var tracks = data.body.tracks;
            for (var i=0; i<tracks.length; i++){
                trackInfos.push({id:tracks[i].id, popularity:tracks[i].popularity})
            }
            trackInfos.sort(function(track1, track2){
                return track2.popularity - track1.popularity;
            });
            var trackids = trackInfos.map(function(trackInfo){return trackInfo.id});
            return trackids.splice(0, 8);
        });
    };
    

    Object.freeze(_spotifyUtils);
    return _spotifyUtils;

})();

module.exports = spotifyUtils;
