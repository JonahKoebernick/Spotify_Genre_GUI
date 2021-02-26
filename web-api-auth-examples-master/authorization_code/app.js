/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
var track_hrefs = new Array();
var num_lists = 0;
var progress = 0;

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = 'd695391f77b04e53bd13d418be938a7d'; // Your client id
var client_secret = '6e25903f90884a0da9f33217ce07b5fd'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var access_token2 = "BQApRK0reKS091K4BFxqpS8IzTb003yYgJiNwBwdenjyaCCf0V3g3cC8AkgZ4pExcMkK-GfwKdd9r9pvYxYeiYKe1SuPvPly3fLdYi3_QRxnsM3FXFZ2P97uMF3xQrTWGk4g3tpyeUAwxvP-AS5kAHBbJ84byls020NA32GfcBS-j52Vhw";

var shuff = 0;
var rep = 0;
var context_save;
var weights = [];
//var gk1 = 0;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

//In Use
    app.get('/login', function(req, res) {

      var state = generateRandomString(16);
      res.cookie(stateKey, state);

      // your application requests authorization
      var scope = 'user-read-private user-read-email user-read-currently-playing user-read-playback-state user-read-recently-played user-read-birthdate user-modify-playback-state user-top-read user-library-read user-library-modify user-follow-modify user-follow-read playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative streaming app-remote-control ';

      res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: client_id,
          scope: scope,
          redirect_uri: redirect_uri,
          state: state
        }));
    });                       //    Logs in user and sets scope.

    app.get('/in_library', function(req, res) {
        var options = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200){
                var song_id = body.item.id;

                console.log("Song ID: " + song_id);

                var temp = 'https://api.spotify.com/v1/me/tracks/contains?ids=' + song_id;

                var options = {
                    url: temp,
                    headers: { 'Authorization': 'Bearer ' + access_token2 },
                    json: true
                };

                request.get(options, function(error, response, body) {
                    if(!error && response.statusCode == 200) {
                        console.log("SUCCESS: /in_library");
    //                  console.log("SUCCESS: " + body);


                      res.send({
                            'in_library' : body,
                      });
                    } else {
                        console.log("ERROR: " + response.statusCode);
                    }
                });

            }
        });

    });                  //    Tests if current song is in users library.

    app.get('/view_album', function(req, res) {
        var options = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200){
    //            console.log("SUCCESS: /view_album");
    //            console.log(body);

                if (body.item != null) var album = body.item.album;
                var album_name = album.name;
                var album_type = album.album_type;
                var all_artists = album.artists;

                var artists = "";

                for (i = 0; i < all_artists.length; i++) {
                    if (i != 0) {
                        artists += ", ";
                    }
                    artists += all_artists[i].name;
                }

                var release_date = album.release_date;
                var album_href = album.href;

                console.log('Album Name: ' + album_name);
                console.log('Album Type: ' + album_type);
                console.log('Album Artists: ' + artists);
                console.log('Album Release: ' + release_date);
                console.log('Album href: ' + album_href);


                var options = {
                    url: album_href,
                    headers: { 'Authorization': 'Bearer ' + access_token2 },
                    json: true
                };

                request.get(options, function(error, response, body) {
                    if(!error && response.statusCode == 200){
    //                    console.log(body);
                        var album_tracks = body.tracks.items;
                        var album_label = body.label;

                        console.log('Album Label: ' + album_label);
                        console.log('Album Tracks: ' + album_tracks[0].name);

                        res.send({
                            'uri': body.uri,
                            'label': album_label,
                            'name': album_name,
                            'type': album_type,
                            'artists': artists,
                            'release': release_date,
                            'href': album_href,
                            'tracks': album_tracks,
                        });
                    }
                });
            }
        });
    });                  //    Gets data on currently playing album.

    app.get('/view_artist', function(req, res) {
        var options = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200){
                console.log("SUCCESS: /view_artist0");
    //            console.log(body);

                var artist = body.item.artists;
                var art_uri = body.item.album.artists[0].uri;
    //            console.log("VIEW " + artist[0].href);

                var options = {
                    url: artist[0].href,
                    headers: { 'Authorization': 'Bearer ' + access_token2 },
                    json: true
                };

                request.get(options, function(error, response, body) {
                    if(!error && response.statusCode == 200){
                        console.log("SUCCESS: /view_artist1");
    //                    console.log("VIEW\n" + body.name);
    //                    console.log(body);
                        var artist_send = body;

                        var options = {
                            url: 'https://api.spotify.com/v1/artists/' + artist_send.id + '/albums',
                            headers: { 'Authorization': 'Bearer ' + access_token2 },
                            json: true
                        };

                        request.get(options, function(error, response, body) {
                            if(!error && response.statusCode == 200){
            //                    console.log("VIEW\n" + body.name);
                                console.log("SUCCESS: /view_artist2");
    //                            console.log(body);
    //                            var artist = body;

                                res.send({
                                    'uri': art_uri,
                                    'artist': artist_send,
                                    'artist_albums': body.items,
                                });
                            }
                        });
                    }
                });
            }
        });
    });                 //    Gets data on currently playing artist.

    app.get('/artist_uri', function(req, res) {
        var options = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200){
    //            console.log(body);

                res.send({
                    'uri': body.item.artists[0].uri,
                });   
            }
        });
    });                  //    Retrieves artist URI.

    app.get('/track_length', function(req, res) {
//        console.log("NEW SONG!");
//        console.log(access_token2);

        var options = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200){
                console.log("SUCCESS: /track_length");
    //            console.log(body);
                var time = body.progress_ms;
                var totaltime = body.item.duration_ms;
                var image = body.item.album.images[0].url;
                var name = body.item.name;
                var artist = body.item.album.artists[0].name;
                var album = body.item.album.name;
                var info = artist + " • " + album;
                if (body.context != null) {
                    var cont_href = body.context.href;

//                    console.log('Progress : ' + time);
//                    console.log(body.item.duration_ms);
//                    console.log(totaltime);
//                    console.log("Image url : "+ body.item.album.images[0].url);
//                    console.log("Name : " + name);
//                    console.log("Artist :" + artist);
//                    console.log('Context : ' + body.context.type + ' [' + cont_href + ']');

                    var options = {
                        url: cont_href,
                        headers: { 'Authorization': 'Bearer ' + access_token2 },
                        json: true
                    };

                    request.get(options, function(error, response, body) {
                        if(!error && response.statusCode == 200){

                            console.log("success " + body.name);
                            var cont = body.name;


                            res.send({
                                'context': cont,
                                'duration_ms': totaltime,
                                'progress_ms': time,
                                'image': image,
                                'name' : name,
                                'artist' : artist,
                                'album' : album
                            });

                        } else {
                            console.log("ERROR: " + response.statusCode);
                        }
                    });
                } else {
                    var cont_href = "Context";

                    console.log('Progress : ' + time);
                    console.log(body.item.duration_ms);
                    console.log(totaltime);
                    console.log("Image url : "+ body.item.album.images[0].url);
                    console.log("Name : " + name);
                    console.log("Artist :" + artist);
                    console.log('Context : [NONE]');

                    res.send({
                        'context': artist,
                        'duration_ms': totaltime,
                        'progress_ms': time,
                        'image': image,
                        'name' : name,
                        'artist' : artist,
                        'album' : album
                    });
                }



    //            res.send({
    //
    //            });
            }
        });
    });                //    Retrieves track length and progress.

    app.get('/info', function(req, res) {
        console.log("NEW SONG!");
        console.log(access_token2);

        var options = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };


        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200){
                console.log("SUCCESS: /info");
    //            console.log(body);

                var time = body.progress_ms;
                var totaltime = body.item.duration_ms;
                var image = body.item.album.images[0].url;
                var name = body.item.name;
                var artist = body.item.artists[0].name;
                var album = body.item.album.name;
                var info = artist + " • " + album;
                if (body.context != null) {
                    var cont_href = body.context.href;

                    console.log('Progress : ' + time);
                    console.log(body.item.duration_ms);
                    console.log(totaltime);
                    console.log("Image url : "+ body.item.album.images[0].url);
                    console.log("Name : " + name);
                    console.log("Artist :" + artist);
                    console.log('Context : ' + body.context.type + ' [' + cont_href + ']');

                    var options = {
                        url: cont_href,
                        headers: { 'Authorization': 'Bearer ' + access_token2 },
                        json: true
                    };

                    request.get(options, function(error, response, body) {
                        if(!error && response.statusCode == 200){

                            console.log("success" + body.name);
                            var cont = body.name;


                            res.send({
                                'context': cont,
                                'duration_ms': totaltime,
                                'progress_ms': time,
                                'image': image,
                                'name' : name,
                                'artist' : artist,
                                'album' : album
                            });

                        } else {
                            console.log("ERROR: " + response.statusCode);
                        }
                    });
                } else {
                    var cont_href = "Context";

                    console.log('Progress : ' + time);
                    console.log(body.item.duration_ms);
                    console.log(totaltime);
                    console.log("Image url : "+ body.item.album.images[0].url);
                    console.log("Name : " + name);
                    console.log("Artist :" + artist);
                    console.log('Context : ' + ' [NONE]');

                    res.send({
                        'context': artist,
                        'duration_ms': totaltime,
                        'progress_ms': time,
                        'image': image,
                        'name' : name,
                        'artist' : artist,
                        'album' : album
                    });
                }

    //            res.send({
    //
    //            });
            }
        });
    });                        //    Gets data on current playback.

    app.get('/curr_track', function(req, res) {
        console.log("NEW SONG!");
        console.log(access_token2);

        var options = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };


        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200){
                console.log("SUCCESS: /curr_track");
    //            console.log(body);

                res.send({
                    'track': body.item,
                });
            } else {
                console.log("ERROR: " + response.statusCode);
            }
        });
    });                  //    Gets track object.

    app.get('/devices', function(req, res) {
        console.log("Checking Devices");
        console.log(access_token2);

        var options = {
            url: 'https://api.spotify.com/v1/me/player/devices',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200 ){
                var devs = body.devices;
                var num = body.devices.length;
                console.log("NUMBER OF DEVICES: " + num);


                for (i = 0; i < num; i++) {
                    if (devs[i].is_active == true) {
                        var current = devs[i];

                        console.log("CURRENT DEVICE: " + current.id);
                    }
                }

                res.send({
                    'num' : num,
                    'current' : current,
                    'all' : devs
                });
            }
        });
    });                     //    Gets list of device objects and current device.

    app.get('/check_playlist', function(req, res) {
        console.log("Checking Devices");
        console.log(access_token2);

        var options = {
            url: 'https://api.spotify.com/v1/me/playlists',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            var has_gui = false;
            var id;

            if(!error && response.statusCode == 200 ){

                console.log("SUCCESS")

                for (i = 0; i < body.items.length; i++) {
    //                 console.log(body.items[i].name);
                    if (body.items[i].name == "GUI") {
                        has_gui = true;
                        console.log(body.items[i]);
                        id = body.items[i].id;
                    }
                }
                console.log(has_gui + " id: " + id);

                if (has_gui) {
                    res.send({
                    'has_gui' : has_gui,
                    'playlist_id' : id,
                    });
                } else {
                    res.send({
                    'has_gui' : has_gui,
                    });
                }

            }
        });
    });              //    Checks for GUI playlist.

    app.get('/recent', function(req, res) {
        console.log("Getting History");
    //    console.log(access_token2);

        var options = {
            url: 'https://api.spotify.com/v1/me/player/recently-played',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200 ) {
                console.log("Worked" + body.items);
                var tracks = body.items;

                var recent_tracks = [tracks[0].track, tracks[1].track, tracks[2].track, tracks[3].track, tracks[4].track, tracks[5].track, tracks[6].track, tracks[7].track, tracks[8].track, tracks[9].track];

                for (i = 0; i < 10; i++) {
                    console.log("HISTORY: " + i + recent_tracks[i].name);
                }

                res.send({
                    'ten_recent' : recent_tracks,
                });
            } else {
                console.log("ERROR: " + response.statusCode);
            }
        });
    });                      //    Gets list of recently played songs.

    app.get('/access_token', function(req, res) {
      res.send({
      'access_token' : access_token2

      });
      console.log("SENNNNNNTTTTTTTTTTTTTTTT");
    });                //    Retrieves access token.

    app.get('/is_playing', function(req, res) {
        var options = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200){
                console.log("SUCCESS: /is_playing");
    //          console.log(body);
                var is_playing = body.is_playing;

                res.send({
                    'is_playing' : is_playing,
                    'access_token' : access_token2
                });
            }
        });
    });                  //    Checks for playing/paused.

    app.get('/context', function(req, res) {

        var options = {
            url: 'https://api.spotify.com/v1/me/player/',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200){
                var context = body.context;
                if (context != null) {
                    var href = context.href;

                    var options = {
                        url: href,
                        headers: { 'Authorization': 'Bearer ' + access_token2 },
                        json: true
                    };

                    request.get(options, function(error, response, body) {
                        if(!error && response.statusCode == 200){

                            console.log("success" + body.name);

                            res.send({
                                'context': body,
                            });

                        } else {
                            console.log("ERROR: " + response.statusCode);
                        }
                    });
                }
            }
        });
    });                     //    Retrieves data on current context.

    app.get('/next_song', function(req, res) {
      console.log("NEXT SONG");

      var pop_value     ={cat: "pop_value",     weight: Number(req.query.pop_value)};
      var queen_value   ={cat: "queen_value",   weight: Number(req.query.queen_value)};
      var tb_value      ={cat: "tb_value",      weight: Number(req.query.tb_value)};
      var country_value ={cat: "country_value", weight: Number(req.query.country_value)};
      var hiphop_value  ={cat: "hiphop_value",  weight: Number(req.query.hiphop_value)};
      var rock_value    ={cat: "rock_value",    weight: Number(req.query.rock_value)};
      var edm_value     ={cat: "edm_value",     weight: Number(req.query.edm_value)};
      var tophits_value ={cat: "tophits_value", weight: Number(req.query.tophits_value)};

      var reqarr = [pop_value, queen_value, tb_value, country_value, hiphop_value, rock_value, edm_value, tophits_value];

      var ulr = new Object();
      ulr["pop_value"]    = "37i9dQZF1DXarRysLJmuju";
      ulr["queen_value"]  = "1IDH2YNH6z6b7d5lz0ze9b";
      ulr["tb_value"]     = "37i9dQZF1DX7F6T2n2fegs";
      ulr["country_value"]= "37i9dQZF1DX13ZzXoot6Jc";
      ulr["hiphop_value"] = "37i9dQZF1DX48TTZL62Yht";
      ulr["rock_value"]   = "37i9dQZF1DX3YMp9n8fkNx";
      ulr["edm_value"]    = "1sP40g8PJLC8GbxJgmeEAg";
      ulr["tophits_value"]= "37i9dQZF1DXcBWIGoYBM5M";

      var amt = new Object();
      amt["pop_value"]    = 113;
      amt["queen_value"]  = 50;
      amt["tb_value"]     = 99;
      amt["country_value"]= 50;
      amt["hiphop_value"] = 50;
      amt["rock_value"]   = 101;
      amt["edm_value"]    = 448;
      amt["tophits_value"]=  53;

      var totnum = 0;
      var c =0;
      for(c; c<reqarr.length; c++){
        totnum = totnum +reqarr[c].weight;
      }


      if(totnum >0){
        var randarr = new Array(totnum);
        var i =0;
        var j =0;
        var less =0;
        var rad = Math.floor(Math.random() * (totnum-1));

        for(i; i<reqarr.length; i++){
          j=less;
          less = less + reqarr[i].weight;
          for(j; j<less;j++){
            randarr[j] = reqarr[i].cat;
          }

        }
        var key = randarr[rad];
          console.log(key);
          console.log("ULR" + ulr[key]);
          console.log("num" + amt[key]);
        res.send({
          'ulr': ulr[key],
          'amt': amt[key],
          'access_token' : access_token2
           });

      }else{
        var arr2 = ["pop_value", "queen_value", "tb_value"];
        var rad2 = Math.floor(Math.random() * 2);
        var key2 = arr2[rad2];
        console.log(key2);
        console.log("ULR" + ulr[key2]);
        console.log("num" + amt[key2]);
        ulr2 = ulr[key2];
        amt2 = amt[key2];
        res.send({
          'ulr': ulr2,
          'amt': amt2,
          'access_token' : access_token2
           });


      }








    });                   //    Sets up next song for original Percent Shuffle.

    app.get('/time', function(req, res) {
            console.log("TIME!");

          var options = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
          };

          request.get(options, function(error, response, body) {
              if(!error && response.statusCode == 200){
                    var time = body.progress_ms;
                    console.log('Progress : ' + time);

                    res.send({
                        'progress_ms': time
                    });
              }
          });


    });                        //    Retrieves remaining time.

    app.get('/progress_ms', function(req, res) {


         console.log("Progress_ms!");


          var options = {
          url: 'https://api.spotify.com/v1/me/player/currently-playing',
          headers: { 'Authorization': 'Bearer ' + access_token2 },
          json: true
          };

          request.get(options, function(error, response, body) {
              if(!error && response.statusCode == 200){
              console.log("SUCCESS: /progress_ms");
    //          console.log(body);
              var time = body.progress_ms;
              var totaltime = body.item.duration_ms;
              console.log('Progress : ' + time);

              console.log(body.item.duration_ms);
              console.log(totaltime);
              console.log("Image url : "+ body.item.images[0]);
              res.send({
             'progress_ms': time
            });
            }
          });


    });                 //    Retrieves remaining time in ms.

    app.get('/callback', function(req, res) {

      // your application requests refresh and access tokens
      // after checking the state parameter

      var code = req.query.code || null;
      var state = req.query.state || null;
      var storedState = req.cookies ? req.cookies[stateKey] : null;

      if (state === null || state !== storedState) {
        res.redirect('/#' +
          querystring.stringify({
            error: 'state_mismatch'
          }));
      } else {
        res.clearCookie(stateKey);
        var authOptions = {
          url: 'https://accounts.spotify.com/api/token',
          form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
          },
          headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
          },
          json: true
        };

        request.post(authOptions, function(error, response, body) {
          if (!error && response.statusCode === 200) {

            var access_token = body.access_token,
                refresh_token = body.refresh_token;
            access_token2 = access_token;

            var options = {
              url: 'https://api.spotify.com/v1/me',
              headers: { 'Authorization': 'Bearer ' + access_token },
              json: true
            };

            // use the access token to access the Spotify Web API
            request.get(options, function(error, response, body) {
              console.log("SUCCESS: /callback");
    //          console.log(body);
            });




            // we can also pass the token to the browser to make requests from there
            res.redirect('/#' +
              querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token
              }));
          } else {
            res.redirect('/#' +
              querystring.stringify({
                error: 'invalid_token'
              }));
          }
        });
      }
    });                    //    Callback.

    app.get('/refresh_token', function(req, res) {

      // requesting access token from refresh token
      var refresh_token = req.query.refresh_token;
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        },
        json: true
      };

      request.post(authOptions, function(error, response, body) {
        console.log("SUCCESS: /refresh_token");
    //      console.log(body);
        if (!error && response.statusCode === 200) {
          var access_token = body.access_token;
          access_token2 = access_token;
          res.send({
            'access_token': access_token
          });
        }
      });
    });               //    Sets refresh token.

    app.get('/is_shuffled', function(req, res) {

        var options = {
            url: 'https://api.spotify.com/v1/me/player',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200){

                var is_shuffled = body.shuffle_state;
                var is_looped = body.repeat_state;
                console.log("Shuffle: " + is_shuffled + " Looped: " + is_looped);

                if (is_shuffled) {
                    shuff = 1;
                } else {
                    shuff = 0;
                }

                if (is_looped == "off") {
                    rep = 0;
                } else if (is_looped == "track") {
                    rep = 2;
                } else if (is_looped == "context") {
                    rep = 3;
                }

                res.send({
                    'shuffled' : is_shuffled,
                    'looped' : is_looped

                });
            }
        });
    });                 //    Toggles the shuffle option.

    app.get('/shuff', function(req, res) {
        shuff++;
        shuff = shuff % 3;

    //    if (shuff == 1) {
    //        var options = {
    //
    //            url: 'https://api.spotify.com/v1/me/player/shuffle?state=true',
    //            headers: {
    //                'Authorization': 'Bearer ' + access_token2
    //            },
    //        };
    //
    //        request.get(options, function(error, response, body) {
    //            if(!error && response.statusCode == 200) {
    //
    //                console.log("Shuffle On");
    //
    //            } else {
    //                console.log("ERROR: " + response.statusCode + " ERROR: " + error + " REASON: " + response.type);
    //            }
    //        });
    //
    //    }

        res.send({
              'test' : shuff,
        });
    });                       //    Increments shuffle.

    app.get('/repeat', function(req, res) {
        rep++;
        rep = rep % 3;

        res.send({
              'test' : rep,
        });
    });                      //    Increments repeat.

    app.get('/user_data', function(req, res) {
        console.log("Getting User");
        console.log(access_token2);

        var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200 ){
                console.log("Success");

                res.send({
                    'img' : body.images[0],
                    'user' : body.id,
                    'name' :body.display_name,
                    'account' : body.product,
                    'email' : body.email,
                });
            } else {
    //            console.log("Error " + response.statusCode);
            }
        });
    });                   //    Retrieves user data.

    app.get('/playlists', function(req, res) {
        console.log("Getting Playlists");
        console.log(access_token2);

        var user_playlists = [];
        var tracks = [];

        var options = {
            url: "https://api.spotify.com/v1/playlists/3Ky98gb5bAG6BmasOSKUir",
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200 ){
                console.log("SUCCESS: /playlists (American Recordings)");
    //            console.log(body);


                var pl = {
                    playlist_uri: body.uri,
                    genre_url: body.id,
                    number_songs: body.tracks.total,
                    genre_name: body.name,
                    tlist: body.tracks.href,
    //                    tracks: playlist_tracks,
    //                    img: body.items[i].images[0].url,
                };
                if (body.images.length > 0) {
                    pl.img = body.images[0].url;
                }

                track_hrefs[0] = pl.tlist;

                user_playlists[0] = pl;

    //            console.log("Owner: " + body.owner.id + "Playlist Name: " + body.name + " Playlist id: " + body.id);

                options = {
                    url: "https://api.spotify.com/v1/me/playlists?limit=39",
                    headers: { 'Authorization': 'Bearer ' + access_token2 },
                    json: true
                };

                request.get(options, function(error, response, body) {
                    if(!error && response.statusCode == 200 ){

                        console.log("Success: " + body + " Number: " + body.items.length);

                        for (i = 0; i < body.items.length; i++) {
                            var pl = {
                                playlist_uri: body.items[i].uri,
                                genre_url: body.items[i].id,
                                number_songs: body.items[i].tracks.total,
                                genre_name: body.items[i].name,
                                tlist: body.items[i].tracks.href,
            //                    tracks: playlist_tracks,
            //                    img: body.items[i].images[0].url,
                            };
                            if (body.items[i].images.length > 0) {
                                pl.img = body.items[i].images[0].url;
                            }

                            track_hrefs[i+1] = pl.tlist;

                            user_playlists[i+1] = pl;

    //                        console.log("Owner: " + body.items[i].owner.id + "Playlist Name: " + body.items[i].name + " Playlist id: " + body.items[i].id);

                        }

                        console.log(user_playlists);

    //                    for(y=0; y < track_hrefs.length; y++) {
    //                        console.log("href[" + y + "]: " + track_hrefs[y]);
    //                    }

                        num_lists = track_hrefs.length;

                        console.log("NUMBER OF PLAYLISTS: " + num_lists);

                        res.send({
                            'playlists' : user_playlists,
                        });
                    } else {
            //            console.log("Error " + response.statusCode);
                    }


                });
            } else {
    //            console.log("Error " + response.statusCode);
            }


        });
    });                   //    Retrieves users playlists.

    app.get('/tracks/:theValue', function(req, res) {
    //    res.send(req.params.theValue.toUpperCase());

        console.log("GETTING TRACKS");
        var tmp = 'https://api.spotify.com/v1/playlists/' + req.params.theValue + '/tracks';
        console.log(tmp);

        var options = {
            url: tmp,
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200 ){
                console.log("SUCCESS");
                var curr = new Array();

                for (gk = 0; gk < body.items.length; gk++) {
                    curr[gk] = body.items[gk].track;
                }

                for (gk = 0; gk < body.items.length; gk++) {
                    console.log(curr[gk]);
                }

                res.send({
                    'tracks': curr,
                });
            } else {
                console.log("FAIL: " + response.statusCode);
            }
        });

    });            //    Retrieves tracks in given playlist.

    app.get('/get_volume', function(req, res) {
        var options = {
            url: 'https://api.spotify.com/v1/me/player/devices',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200 ){
                var devs = body.devices;
                var num = body.devices.length;
                console.log("NUMBER OF DEVICES: " + num);
                var vol;

                for (i = 0; i < num; i++) {
                    if (devs[i].is_active == true) {
                        var current = devs[i];

                        console.log("current " + current);
                        vol = current.volume_percent;
                    }
                }

                if (current == null) {
                    vol = 0;
                }

                res.send({
                    'volume' : vol,
                });
            }
        });
    });                  //    Retrieves current devices volume.

    app.get('/set_volume/:vol', function(req, res) {
    //    res.send(req.params.theValue.toUpperCase());
        console.log("VOLUME REQUEST: [" + req.params.vol + "]");

    //    var temp_url = "https://api.spotify.com/v1/me/player/volume?volume_percent=" + req.params.vol + "&device_id="; HERE BABY I FIGURED IT OUT FUCK YES GET FUCKED MF'er
        var options = {
            url: 'https://api.spotify.com/v1/me/player/devices',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200 ){
                var devs = body.devices;
                var num = body.devices.length;
                console.log("NUMBER OF DEVICES: " + num);


                for (i = 0; i < num; i++) {
                    if (devs[i].is_active == true) {
                        var current = devs[i];

                        console.log("CURRENT DEVICE: " + current.id);
                    }
                }

                options = {
                    url: "PUT https://api.spotify.com/v1/me/player/volume?volume_percent=" + req.params.vol + "&device_id=" + current.id,
                    type: 'PUT',
                    headers: { 
                        'Authorization': 'Bearer ' + access_token2,
                    },
                    dataType: "json",
                };

                request.get(options, function(error, response, body) {
                    if(!error && response.statusCode == 200 ){
                        console.log("SUCCESS");
                        console.log("SUCCESS: /set_volume");
            //              console.log(body);

            //            res.send({
            //                'results': body,
            //            });
                    } else {
    //                    console.log("FAIL: " + response.statusCode);
                        console.log("FAIL: >" + options.url + "<");
                    }
                });
            }
        });


    });             //    Sets volume.

    app.get('/search/:keywords', function(req, res) {
    //    res.send(req.params.theValue.toUpperCase());

        console.log("GETTING KEYW0RDS");

        var keys = "";

        for (gk = 0; gk < req.params.keywords.length; gk++) {
            if (req.params.keywords[gk] != " ") {
                keys += req.params.keywords[gk];
            } else {
                keys += "%20";
            }
        }

        var url = "https://api.spotify.com/v1/search?q=" + keys + "&type=album,track,artist,playlist&limit=10";

        console.log(keys);
        console.log(url);

        var options = {
            url: url,
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200 ){
                console.log("SUCCESS");
                console.log("SUCCESS: /search");
    //              console.log(body);

                res.send({
                    'results': body,
                });
            } else {
                console.log("FAIL: " + response.statusCode);
            }
        });

    });            //    Searches for given keywords.

    app.get('/store_context', function(req, res) {
        var options = {
            url: 'https://api.spotify.com/v1/me/player/',
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200){
                if (body.context != null) {
                    context_save = {
                        'uri': body.context.uri,
                        'rep': body.repeat_state,
                        'shuff': body.shuffle_state,
                    };

                    console.log("CONTEXT" + context_save);

                    res.send({
                        'context' : context_save,
                    });
                } else {
                    context_save = {
                        'rep': body.repeat_state,
                        'shuff': body.shuffle_state,
                    };

                    var options = {
                        url: 'https://api.spotify.com/v1/me/top/artists?limit=1&time_range=short_term',
                        headers: { 'Authorization': 'Bearer ' + access_token2 },
                        json: true
                    };

                    request.get(options, function(error, response, body) {
                        if(!error && response.statusCode == 200) {
                            console.log("NO CONTEXT: " + body.items[0].uri);
                            context_save.uri = body.items[0].uri;

                            res.send({
                                'context' : context_save,
                            });
                        } else {
                            console.log("SHIT: " + response.statusCode);
                        }
                    });
                }
            }
        });
    });               //    Stores current context for queue.

    app.get('/restore_context', function(req, res) {
        console.log("OLD CONTEXT: " + context_save);
        res.send({
            'context' : context_save,
        });
    });             //    Restores context after queue.

    app.get('/store_weights/:store', function(req, res) {
        var input_data = req.params.store.split(":");
        console.log("Playlist: [" + input_data[0] + ", " + input_data[1] + "]");

        weights[input_data[0]] = input_data[1];

        console.log("Weights: " + weights);

        res.send({
            'context' : true,
        });
    });        //    Stores current percent shuffle weights.

    app.get('/return_weights', function(req, res) {
        res.send({
              'test' : weights[0],
        });
    });              //    Returns current percent shuffle weights.

//In Progres
    app.get('/set_volume_original/:vol', function(req, res) {
    //    res.send(req.params.theValue.toUpperCase());
        console.log("VOLUME REQUEST: [" + req.params.vol + "]");

    //    var temp_url = "https://api.spotify.com/v1/me/player/volume?volume_percent=" + req.params.vol + "&device_id="; HERE BABY I FIGURED IT OUT FUCK YES GET FUCKED MF'er
        var options = {
            url: "https://api.spotify.com/v1/me/player/volume?volume_percent=" + req.params.vol,
            type: 'PUT',
            headers: { 
                'Authorization': 'Bearer ' + access_token2,
                'Content-Type': "application/json",
                'Accept': "application/json",
            },
            dataType: "json",
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200 ){
                console.log("SUCCESS");
                console.log("SUCCESS: /set_volume");
    //              console.log(body);

    //            res.send({
    //                'results': body,
    //            });
            } else {
                console.log("FAIL: " + response.statusCode);
                console.log("FAIL: >" + options.url + "<");
            }
        });
    });    //    Set volume w/ device.

    app.get('/playlists_personal', function(req, res) {
        console.log("Getting Playlists");
        console.log(access_token2);

        var user_playlists = [];
        var tracks = [];

        var options = {
            url: "https://api.spotify.com/v1/me/playlists?limit=40",
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200 ){

                console.log("Success: " + body + " Number: " + body.items.length);
                gk1 = 0;

                for (i = 0; i < body.items.length; i++) {
                    if (body.items[i].owner.id == "jude_the_dude55") {
    //                    console.log("PERSONAL");
                        var pl = {
                            playlist_uri: body.items[i].uri,
                            genre_url: body.items[i].id,
                            number_songs: body.items[i].tracks.total,
                            genre_name: body.items[i].name,
                            tlist: body.items[i].tracks.href,
                            href: body.items[i].href,
        //                    tracks: playlist_tracks,
        //                    img: body.items[i].images[0].url,
                        };
                        if (body.items[i].images.length > 0) {
                            pl.img = body.items[i].images[0].url;
                        }

                        track_hrefs[gk1] = pl.tlist;

                        user_playlists[gk1] = pl;

                        console.log("Owner: " + body.items[i].owner.id + "Playlist Name: " + body.items[i].name + " Playlist id: " + body.items[i].id);

                        gk1++;
                    }
                }

                console.log("TOTAL PLAYLISTS: " + user_playlists.length);

                options = {
                    url: "https://api.spotify.com/v1/me/playlists?limit=40&offset=40",
                    headers: { 'Authorization': 'Bearer ' + access_token2 },
                    json: true
                };

                request.get(options, function(error, response, body) {
                    if(!error && response.statusCode == 200 ){

                        console.log("Success: " + body + " Number: " + body.items.length);

                        for (j = 0; j < body.items.length; j++) {
                            if (body.items[j].owner.id == "jude_the_dude55") {
    //                            console.log("PERSONAL");
                                var pl = {
                                    playlist_uri: body.items[j].uri,
                                    genre_url: body.items[j].id,
                                    number_songs: body.items[j].tracks.total,
                                    genre_name: body.items[j].name,
                                    tlist: body.items[j].tracks.href,
                                    href: body.items[j].href,
                //                    tracks: playlist_tracks,
                //                    img: body.items[i].images[0].url,
                                };
                                if (body.items[j].images.length > 0) {
                                    pl.img = body.items[j].images[0].url;
                                }

                                track_hrefs[gk1] = pl.tlist;

                                user_playlists[gk1] = pl;

                                console.log("Owner: " + body.items[j].owner.id + "Playlist Name: " + body.items[j].name + " Playlist id: " + body.items[j].id);

                                gk1++;
                            }

                        }

                        console.log("TOTAL PLAYLISTS: " + user_playlists.length);

                        options = {
                            url: "https://api.spotify.com/v1/me/playlists?limit=40&offset=80",
                            headers: { 'Authorization': 'Bearer ' + access_token2 },
                            json: true
                        };

                        request.get(options, function(error, response, body) {
                            if(!error && response.statusCode == 200 ){

                                console.log("Success: " + body + " Number: " + body.items.length);

                                for (j = 0; j < body.items.length; j++) {
                                    if (body.items[j].owner.id == "jude_the_dude55") {
    //                                    console.log("PERSONAL");
                                        var pl = {
                                            playlist_uri: body.items[j].uri,
                                            genre_url: body.items[j].id,
                                            number_songs: body.items[j].tracks.total,
                                            genre_name: body.items[j].name,
                                            tlist: body.items[j].tracks.href,
                                            href: body.items[j].href,
                        //                    tracks: playlist_tracks,
                        //                    img: body.items[i].images[0].url,
                                        };
                                        if (body.items[j].images.length > 0) {
                                            pl.img = body.items[j].images[0].url;
                                        }

                                        track_hrefs[gk1] = pl.tlist;

                                        user_playlists[gk1] = pl;

                                        console.log("Owner: " + body.items[j].owner.id + "Playlist Name: " + body.items[j].name + " Playlist id: " + body.items[j].id);

                                        gk1++;
                                    }

                                }

                                console.log(user_playlists);

                                for(y=0; y < track_hrefs.length; y++) {
                                    console.log("href[" + y + "]: " + track_hrefs[y]);
                                }

                                num_lists = track_hrefs.length;

                                console.log("NUMBER OF PLAYLISTS: " + num_lists);

                                res.send({
                                    'playlists' : user_playlists,
                                });
                            } else {
                    //            console.log("Error " + response.statusCode);
                            }


                        });

    //                    console.log(user_playlists);
    //
    //                    for(y=0; y < track_hrefs.length; y++) {
    //                        console.log("href[" + y + "]: " + track_hrefs[y]);
    //                    }
    //
    //                    num_lists = track_hrefs.length;
    //
    //                    console.log("NUMBER OF PLAYLISTS: " + num_lists);
    //
    //                    res.send({
    //                        'playlists' : user_playlists,
    //                    });
                    } else {
            //            console.log("Error " + response.statusCode);
                    }


                });



    //            console.log(user_playlists);
    //
    //            for(y=0; y < track_hrefs.length; y++) {
    //                console.log("href[" + y + "]: " + track_hrefs[y]);
    //            }
    //
    //            num_lists = track_hrefs.length;
    //
    //            console.log("NUMBER OF PLAYLISTS: " + num_lists);
    //
    //            res.send({
    //                'playlists' : user_playlists,
    //            });
            } else {
    //            console.log("Error " + response.statusCode);
            }


        });
    });          //    Retrieves users created playlists.

    app.get('/getData/:search_url', function(req, res) {
//        res.send(req.params.theValue.toUpperCase());
        console.log("HERE");
        var tmp = req.params.search_url;
        console.log(tmp);

        var options = {
            url: tmp,
            headers: { 'Authorization': 'Bearer ' + access_token2 },
            json: true
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200 ){
                console.log("SEARCH TEST");

                console.log(body);

                res.send({
    //                'tracks': curr,
                });
            } else {
                console.log("FAIL: " + response.statusCode);
            }
        });

    });         //    Old?

console.log('Listening on 8888');
app.listen(8888);


/*

3Ky98gb5bAG6BmasOSKUir
"name": "American Recordings",
      "owner": {
        "display_name": "Bailey Kulman",
        "external_urls": {
          "spotify": "https://open.spotify.com/user/jude_the_dude55"
        },
        "href": "https://api.spotify.com/v1/users/jude_the_dude55",
        "id": "jude_the_dude55",
        "type": "user",
        "uri": "spotify:user:jude_the_dude55"
      },
      "primary_color": null,
      "public": false,
      "snapshot_id": "OCxmY2JmYjU0MjQxMzk0ODA0M2UxYTIzNDMyMWEyZDdlNDA0NmMwZWRi",
      "tracks": {
        "href": "https://api.spotify.com/v1/playlists/3Ky98gb5bAG6BmasOSKUir/tracks",
        */

//https://api.spotify.com/v1/me/player/volume?volume_percent=56&device_id=e32904b179b37a78b6b5713ba1f0022c0ecd4474
//https://api.spotify.com/v1/me/player/volume?volume_percent=55&device_id=e32904b179b37a78b6b5713ba1f0022c0ecd4474
//https://api.spotify.com/v1/me/player/volume?volume_percent=100&device_id=e32904b179b37a78b6b5713ba1f0022c0ecd4474