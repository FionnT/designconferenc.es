const bcrypt = require('bcrypt')
const cookie = require('cookie')
const pug = require('pug')
const router = require('express').Router()
const passport = require('passport')

const LocalStrategy = require('passport-local').Strategy

var models = require('./mongoose/models.js')
var person = models.person
var isAdmin = require('./commands/privileges')

passport.serializeUser(function (user, done) { done(null, user.id) })
passport.deserializeUser(function (user, done) { done(null, user) })

passport.use(new LocalStrategy(
  (username, password, done) => {
    var criteria = (username.indexOf('@') === -1) ? { username: username } : { email: username }
    person.findOne(criteria, function (err, user) {
      // All the same...
      if (err) { return done(null, err) }
      if (!user) return done(null, false)
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) { console.log(err) }
        if (!res) return done(null, false)
        return done(null, user)
      })
    })
  })
)

router.get('/logout', function (req, res) {
  res.clearCookie('UID')
  res.redirect('/')
})

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/failed' }), (req, res) => {
    console.log(req.query)
    res.cookie('UID', req.session.passport.user, { expires: new Date(Date.now() + 1800000), httpOnly: true, encode: String })
    res.redirect('/')
  }
)

router.get('/login', (req, res) => {
  person.findOne({ _id: req.cookies.UID }, function (err, user) {
    if (err) { console.log(err) }
    if (user) res.redirect('/')
    else res.render('auth')
  })
})

module.exports = router
