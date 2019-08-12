const pug = require('pug');
const router = require('express').Router();
const async = require("async");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const cookie = require('cookie');
const saltRounds = 10;

var models = require("./mongoose/models.js")
var Person = models.person;

passport.serializeUser(function(user, done) {done(null, user.id);});
passport.deserializeUser(function(user, done) {done(null, user);});

passport.use(new LocalStrategy(
  (username, password, done) => {
    var criteria = (username.indexOf('@') === -1) ? {username: username} : {email: username};
    Person.findOne(criteria, function(err, user){
        // All the same...
      if (err) { return done(null, err); }
      if (!user) return done(null, false);
      bcrypt.compare(password, user.password, (err, res) => {
        if (!res) return done(null, false);
        return done(null, user);
      });
    });
  })
);

router.post("/register", (req, res, next) => {
  // req.body => string => object; Making it updateable!
  var object = JSON.parse(JSON.stringify(req.body));
  var pass = object.password;
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(pass, salt, function(err, hash) {
      object.password = hash;
      var uData = new Person(object);
      uData.save()
        .then(item => {
          res.redirect("./login")
        })
        .catch(err => {
          res.sendStatus(500).send("unable to save to database");
        });
    });
  });
});

router.get('/logout', function(req, res){
  res.clearCookie('UID');
  res.redirect('/');
});

router.post('/login',
  passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
    res.cookie('UID', req.session.passport.user, { expires: new Date(Date.now() + 1800000), httpOnly: true, encode: String });
    res.redirect('/');
  }
);

router.get('/login', (req, res) => {
  Person.findOne({_id: req.cookies.UID}, function(err, user){
    if(user) res.redirect("index")
    else res.render("auth")
  })
})

module.exports = router;
