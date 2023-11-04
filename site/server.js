/* === Imports === */
const fs = require('fs');
const express = require('express');
const jwt_sign = require('jsonwebtoken').sign;
//Auth part
var passport = require("passport");
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = fs.readFileSync('pubkey.pem');
opts.algorithms = ["RS256","HS256"];
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    if (jwt_payload.admin == 1) {
        return done(null, true);
    } else {
        return done(null, false);
    }
}));

const app = express();
app.use(express.json());
app.use(passport.initialize());
app.use(express.static(__dirname + '/static'));

//To get the flag
app.get('/admin' ,passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send({flag: 'flag{st3al_PRs_and_pr0fit!!}'});
});

//Gives the user a RS256 token
app.get('/guest', (req, res) => {
  const payload = {name: 'Guest', admin: 0};
  guestToken= jwt_sign(payload, fs.readFileSync('privatekey.pem'), { algorithm: 'RS256'})
  res.send({guest: guestToken});
});

//Path traversal to get pubkey.pem
app.get('/image', (req,res) => {
  //I'll ban these files, this way they have to stick to the vuln
  if((req.query.image).includes('privatekey.pem') || (req.query.image).includes('csr.pem') || (req.query.image).includes('server.crt') || (req.query.image).includes('server.js')){
    res.sendStatus(403);
  } else{
    try{
      let image_file = (__dirname+'/images/'+req.query.image);
      res.send(fs.readFileSync(image_file));
    } catch(e){
      res.sendStatus(404);
    }
  }
});
const sock_path = '/sock/app.sock';
try {fs.unlinkSync(sock_path);} catch (e) {}
app.listen(sock_path, function(){fs.chmodSync(sock_path, '774');})
