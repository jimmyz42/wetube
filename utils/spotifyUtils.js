var SpotifyWebApi = require('spotify-web-api-node');
var utils = require('./utils');
var Promise = require('bluebird');

var spotifyUtils = (function () {

    var _spotifyUtils = {};
    
    //Permissions we need to access user's Spotify playlists
    var scopes = ['user-read-private', 'playlist-read-private', 'playlist-modify-public', 
             'playlist-modify-private'];
    
    var state = 'state';

    //create a new object with this info
    //TODO: CHANGE REDIRECT URI TO DEPLOYED VERSION
    var spotifyApi = new SpotifyWebApi({
      redirectUri : 'http://mit-wetube.herokuapp.com/callback', 
        clientId : '5936eea86d9f4634b00534b79dde8b4c',
    clientSecret : '8e1ca161f7ca4b1d844509cf89903b01',
    });
    
    
    /*
    @param track: a spotify track object, with a bunch of properties
    @return a new track object, with only the properties we care about
    */
    var extractTrackInfo = function(track){
        trackArtists = "";
        for (var j=0; j<track.artists.length;j++){
            trackArtists = trackArtists + track.artists[j].name + " ";
        };
        var albumArtUrl = "/images/defaultArtist.png";
        if (track.album.images.length > 0){
            albumArtUrl = track.album.images[track.album.images.length-1].url;
        }
        songInfo = {
            title: track.name, 
            popularity:track.popularity,
            previewUrl:track.preview_url,
            id:track.id,
            artists:trackArtists,
            albumArtUrl:albumArtUrl
        };
        return songInfo;
    };
    
    /*
    @param track: a spotify artist object, with a bunch of properties
    @return a new artist object, with only the properties we care about
    */
    var extractArtistInfo = function(artist){
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
        return artistInfo;
    }
    
    /*
    Searches for songs whose names match the searchString. 
    Returns a promise of an array of potential matches. Each potential match is a javascript object with 
    properties name, artist, popularity, previewUrl, albumArtUrl, and id. 
    Currently returns the top 20 matches. We can trim this down if wanted. Also sorts by popularity.
    */
     _spotifyUtils.getTrackMatches = function(searchString){
        return spotifyApi.searchTracks(searchString)
        .then(function(data){
    
            var firstPage = data.body.tracks.items;
            var matchedSongs = [];
            for (var i=0; i<firstPage.length; i++){
                var track = firstPage[i];
                matchedSongs.push(extractTrackInfo(track));
            };
            
            matchedSongs.sort(function(song1, song2){
                return song2.popularity - song1.popularity;
            });
            return matchedSongs;
        }, function(err) {
            console.error(err);
        });
    };
    
     /*
    Searches for artists whose names match the searchString. 
    Returns a promise of an array of potential matches. Each potential match is a javascript object with 
    properties name, popularity, and id. 
    Currently returns the top 20 matches. We can trim this down if wanted. Also sorts by popularity.
    */
    _spotifyUtils.getArtistMatches = function(searchString){
        return spotifyApi.searchArtists(searchString, {limit: 10, offset: 0})
        .then(function(data) {
            console.log('got first page');
            var firstPage = data.body.artists.items;
            matchedArtists = [];
            console.log(firstPage);
            for (var i=0; i<firstPage.length; i++){
                artist = firstPage[i];
                matchedArtists.push(extractArtistInfo(artist));
            };
            
            matchedArtists.sort(function(artist1, artist2){
                return artist2.popularity - artist1.popularity;
            });
            
            return matchedArtists;
        }, function(err){
            console.log(err);
        });
    };
    
/*
    songIDs is an array of valid spotify song IDs
    Returns a promise of an array of objects with properties title, popularity, previewUrl, id, artists, albumArtUrl
    */
    _spotifyUtils.getSongsInfo = function(songIDs){
        if (songIDs.length===0){
            return new Promise(function(resolve, reject) {
                resolve([]);
            });
        }
        //We can only do at most fifty tracks in each call
        var getFiftyTracks = function(songChunkIDs){
            return spotifyApi.getTracks(songChunkIDs)
            .then(function(data){
                var tracks=data.body.tracks;
                var trackInfos = [];
                for (var i=0; i<tracks.length; i++){
                    var track = tracks[i];
                    trackInfos.push(extractTrackInfo(track));
                };
                return trackInfos;
            });
        }
        var songIdsSplit = [];
        for (var i=0; i<Math.ceil(songIDs.length/50); i++){
            songIdsSplit.push(songIDs.slice(50*i,50*i+50));
        }
        var promiseArray = songIdsSplit.map(getFiftyTracks);
        return Promise.reduce(promiseArray, function(total, tracks) {
            return total.concat(tracks);
        }, []);
        
    };
    
    /*
    songIDs is an array of artistObjs, which have property id, which is a valid spotify artist id
    Returns a promise of an array of objects with properties name, popularity, imageUrl, id, artists
    */
    _spotifyUtils.getArtistsInfo = function(artistOjbs){
        if (artistOjbs.length ===0){
            return new Promise(function(resolve, reject) {
                resolve([]);
            });
        }
        var artistIDs = artistOjbs.map(function(artistObj){
                                      return artistObj.id});
        //We can only do 50 artists per one call to the api
        var getFiftyArtists = function(){
            return spotifyApi.getArtists(artistIDs)
            .then(function(data){
                var artists=data.body.artists;
                var artistInfos = [];
                    for (var i=0; i<artists.length; i++){
                        var artist = artists[i];
                        artistInfos.push(extractArtistInfo(artist));
                    };
                    return artistInfos;
            });
        };
        var artistObjsSplit = [];
        for (var i=0; i<Math.ceil(artistOjbs.length/50); i++){
            artistObjsSplit.push(artistOjbs.slice(50*i,50*i+50));
        }
        var promiseArray = artistObjsSplit.map(getFiftyArtists);
        return Promise.reduce(promiseArray, function(total, artists) {
            return total.concat(artists);
        }, []);
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
    
    /**
    Gets the URL to send the user to, to ask for permissions
    **/
    _spotifyUtils.getAuthorizeURL = function(){
        return spotifyApi.createAuthorizeURL(scopes, state);
    }
    
    /*
    Sets information for authorization flow
    Sets a timer so that before the access token expires, it gets refreshed
    Returns a promise of when all the setting is complete
    */
    _spotifyUtils.setAuthorizeInfo = function(code, state){
        /* Get the access token! */
        return spotifyApi.authorizationCodeGrant(code)
        .then(function(data) {
            // Set the access token on the API object to use it in later calls
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
            
            var tokenExpirationEpoch = data.body['expires_in'];
            setInterval(function() {
                // Refresh token and print the new time to expiration.
                spotifyApi.refreshAccessToken()
                .then(function(data) {
                    tokenExpirationEpoch = (new Date().getTime() / 1000) + data.body['expires_in'];
                  }, function(err) {
                    console.log('Could not refresh the token!', err.message);
                  });
            }, 4*tokenExpirationEpoch/5);
        });
    };
    
    /**
    Get information about the current user's playlists
    Returns a promise of an array, where each element is a "playlist object"
    A playlist object has properties as follows:
        {name: name of Playlist, 
         id: id of Playlist, 
         ownerid: id of the owner}
    **/
    _spotifyUtils.getPlaylistInfo = function(){
          // Get the authenticated user
        return spotifyApi.getMe()
        .then(function(data) {
            console.log('Some information about the authenticated user', data.body);
            return spotifyUserId = data.body.id;
        }).then(function(userID){
            return spotifyApi.getUserPlaylists(userID);
        }).then(function(data){
            console.log('data');
            console.log(data.body);
            var playlistArray = data.body.items;
            var playlists = [];
            for (var i=0; i<playlistArray.length; i++){
                playlists.push({id:playlistArray[i].id, name:playlistArray[i].name, 
                                ownerid: playlistArray[i].owner.id});
            }
            return playlists;
        });
    };
    
    /**
    Gets the tracks of a playlist
    Returns a promise of an array, where each element is a "playlist object"
    A playlist object has properties as follows:
        {name: name of Playlist, 
         id: id of Playlist, 
    **/
    _spotifyUtils.getPlaylistTracks = function(playlistObj){
        // Get a playlist
        console.log('inside get playlistTracks, playlistObj is');
        console.log(playlistObj);
        var ownerID = playlistObj.ownerID;
        var playlistID = playlistObj.playlistID;
        return spotifyApi.getPlaylistTracks(ownerID, playlistID)
        .then(function(data) {
       //     console.log('Some information about this playlist', data.body);
            console.log('data');
            var trackObjs = data.body.items;
            var trackIDs = [];
            for (var i=0; i<trackObjs.length; i++){
                if (trackObjs[i].track.id){
                    trackIDs.push(trackObjs[i].track.id)
                }
            };
            return trackIDs;
        });
    };
    
    Object.freeze(_spotifyUtils);
    return _spotifyUtils;

})();

module.exports = spotifyUtils;
