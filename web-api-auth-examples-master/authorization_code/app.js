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

var client_id = '6a1dee40c53c44bc878500598823ddf1'; // Your client id
var client_secret = '5f979a0e0f314a26b251c45680e84b65'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var access_token2 = "";

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
  var scope = 'user-read-private user-read-email user-modify-playback-state user-read-currently-playing user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
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
          console.log('Progress : ' + time);
          
          console.log(body.item.duration_ms);
          console.log(totaltime);
          res.send({
         'duration_ms': totaltime,
         'progress_ms': time
        });
        }
      });

   
});
app.get('/access_token', function(req, res) {
  res.send({
  'access_token' : access_token2
  
  });
  console.log("SENNNNNNTTTTTTTTTTTTTTTT");
  
  
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

console.log('Listening on 8888');
app.listen(8888);
