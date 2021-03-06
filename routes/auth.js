const router = require('express').Router()
const passport = require('passport')
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy

const models = require('./mongoose/models')
const person = models.person

passport.serializeUser((user, done) => {
	done(null, user.id)
})
passport.deserializeUser((user, done) => {
	done(null, user)
})

passport.use(
	new LocalStrategy((username, password, done) => {
		let criteria = username.indexOf('@') === -1 ? {username: username} : {email: username} // All the same...
		person.findOne(criteria, function(err, user) {
			if (err) return done(null, err)
			else if (!user) return done(null, false)
			else {
				bcrypt.compare(password, user.password, (err, res) => {
					if (err) console.log(err)
					if (!res) return done(null, false)
					return done(null, user)
				})
			}
		})
	})
)

router.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
	res.cookie('UID', req.session.passport.user, {
		expires: new Date(Date.now() + 1.44e7), // 4 hours
		httpOnly: true,
		encode: String
	})
	res.redirect('/approve')
})

router.get('/login', (req, res) => {
	person.findOne({_id: req.cookies.UID}, function(err, user) {
		if (err) console.log(err)
		else if (user) res.redirect('/')
		else res.render('auth')
	})
})

router.get('/logout', function(req, res) {
	res.clearCookie('UID')
	res.redirect('/')
})

module.exports = router
