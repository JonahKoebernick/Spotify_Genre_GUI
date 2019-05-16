/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = 'd695391f77b04e53bd13d418be938a7d'; // Your client id
var client_secret = '2e8918fcc2e74c9ab3e6b875597cccb0'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var access_token2 = "BQApRK0reKS091K4BFxqpS8IzTb003yYgJiNwBwdenjyaCCf0V3g3cC8AkgZ4pExcMkK-GfwKdd9r9pvYxYeiYKe1SuPvPly3fLdYi3_QRxnsM3FXFZ2P97uMF3xQrTWGk4g3tpyeUAwxvP-AS5kAHBbJ84byls020NA32GfcBS-j52Vhw";

var shuff = 0;
var rep = 0;

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

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-modify-playback-state user-read-currently-playing user-read-playback-state user-read-recently-played playlist-read-private user-library-read playlist-modify-public playlist-modify-private user-modify-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

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
                  console.log("SUCCESS: " + body);


                  res.send({
                        'in_library' : body,
                  });
                } else {
                    console.log("ERROR: " + response.statusCode);
                }
            });
            
        }
    });

});

app.get('/track_length', function(req, res) {


     console.log("NEW SONG!");
     console.log(access_token2);
  
      var options = {
      url: 'https://api.spotify.com/v1/me/player/currently-playing',
      headers: { 'Authorization': 'Bearer ' + access_token2 },
      json: true
      };
    
      request.get(options, function(error, response, body) {
          if(!error && response.statusCode == 200){
          console.log(body);
          var time = body.progress_ms;
          var totaltime = body.item.duration_ms;
          var image = body.item.album.images[0].url;
          var name = body.item.name;
          var artist = body.item.album.artists[0].name;
          var album = body.item.album.name;
          var info = artist + " • " + album;
          console.log('Progress : ' + time);
          
          console.log(body.item.duration_ms);
          console.log(totaltime);
          console.log("Image url : "+ body.item.album.images[0].url);
          console.log("Name : " + name);
          console.log("Artist :" + artist);
          res.send({
         'duration_ms': totaltime,
         'progress_ms': time,
         'image': image,
         'name' : name,
         'artist' : artist,
         'album' : album
         
        });
        }
      });

   
});

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
                    
                    console.log(current);
                } 
            }
            
            res.send({
                'num' : num,
                'current' : current,
                'all' : devs
            });
        }
    });
});

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
});

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
            console.log("Worked");
            var tracks = body.items;
            
            var recent_tracks = [tracks[0].track, tracks[1].track, tracks[2].track, tracks[3].track, tracks[4].track, tracks[5].track, tracks[6].track, tracks[7].track, tracks[8].track, tracks[9].track];
            
//            for (i = 0; i < 10; i++) {
//                console.log(i + recent_tracks[i].name);
//            }
            
            res.send({
                'ten_recent' : recent_tracks,
            });
        } else {
            console.log("ERROR: " + response.statusCode);
        }
    });
});

app.get('/access_token', function(req, res) {
  res.send({
  'access_token' : access_token2
  
  });
  console.log("SENNNNNNTTTTTTTTTTTTTTTT");
});

app.get('/is_playing', function(req, res) {
  
var options = {
      url: 'https://api.spotify.com/v1/me/player/currently-playing',
      headers: { 'Authorization': 'Bearer ' + access_token2 },
      json: true
      };
    
      request.get(options, function(error, response, body) {
          if(!error && response.statusCode == 200){
          console.log(body);
          var is_playing = body.is_playing;
         
          res.send({
          'is_playing' : is_playing,
          'access_token' : access_token2
         
        });
        }
      });
});

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
  
  
  
  

  
 
  
});

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

   
});

app.get('/progress_ms', function(req, res) {


     console.log("Progress_ms!");

  
      var options = {
      url: 'https://api.spotify.com/v1/me/player/currently-playing',
      headers: { 'Authorization': 'Bearer ' + access_token2 },
      json: true
      };
    
      request.get(options, function(error, response, body) {
          if(!error && response.statusCode == 200){
          console.log(body);
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

   
});

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
          console.log(body);
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
});

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
    console.log(body);
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      access_token2 = access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

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
});

app.get('/shuff', function(req, res) {
    shuff++;
    shuff = shuff % 3;
    
    if (shuff == 1) {
        var options = {
            url: 'https://api.spotify.com/v1/me/player/shuffle?state=true',
            headers: { 
                'Authorization': 'Bearer ' + access_token2 
            },
        };

        request.get(options, function(error, response, body) {
            if(!error && response.statusCode == 200) {

                console.log("Shuffle On");

            } else {
                console.log("ERROR: " + response.statusCode);
            }
        });

    }
    
    res.send({
          'test' : shuff,
    });
});

app.get('/repeat', function(req, res) {
    rep++;
    rep = rep % 3;
    
    res.send({
          'test' : rep,
    });
});

function test(string) {
    console.log(string);
}


console.log('Listening on 8888');
app.listen(8888);
