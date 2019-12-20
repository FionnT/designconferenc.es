const router = require('express').Router()
const isAdmin = require('./privileges')
const models = require('./mongoose/models')
const person = models.person
const conferences = models.conference

// No processing required

router.get('/failed', (req, res) => res.send('Failed'))
router.get('/404', (req, res) => res.render('404'))

// Processing required

// For development purposes
//
// router.get('/reset', (req, res) => {
//   conferences.find({}, (err, results) => {
//     results.forEach((item) => {
//        item.remove()
//      })
//     res.redirect('/')
//   })
// })

router.get('/', (req, res) => {
	let n = new Date().getTime()
	try {
		person.findOne({_id: req.cookies.UID}, (err, user) => {
			if (err) throw err
			conferences
				.find({approved: true})
				.sort({UTC: 'asc'})
				.exec((err, results) => {
					if (err) throw err
					else if (results.length) {
						results.forEach(item => {
							if (item.UTC < n) item.remove()
						})
						res.render('index', {
							list: results,
							user: user
						})
					} else {
						res.render('index', {
							user: user
						})
					}
				})
		})
	} catch (err) {
		console.log(err)
	}
})

router.get('/add', (req, res) => {
	isAdmin.basic(
		req,
		res,
		user => {
			res.render('submit', {
				user: user
			})
		},
		() => {
			res.redirect('/submit')
		}
	)
})

router.get('/admin', (req, res) => {
	try {
		isAdmin.level(
			req,
			res,
			1,
			user => {
				person.find({}, (err, users) => {
					if (err) throw err
					else {
						res.render('admin', {
							user: user,
							users: users
						})
					}
				})
			},
			() => {
				res.redirect('/')
			}
		)
	} catch (err) {
		console.log(err)
	}
})

router.get('/approve', (req, res) => {
	try {
		isAdmin.basic(
			req,
			res,
			user => {
				conferences
					.find({approved: false})
					.sort({UTC: 'asc'})
					.exec((err, results) => {
						if (err) throw err
						else if (results.length) {
							res.render('index', {
								manage: true,
								list: results,
								result: results.length,
								user: user
							})
						} else {
							res.render('index', {
								manage: true,
								user: user
							})
						}
					})
			},
			() => {
				res.redirect('/')
			}
		)
	} catch (err) {
		console.log(err)
	}
})

router.get('/manage', (req, res) => {
	try {
		isAdmin.basic(
			req,
			res,
			user => {
				conferences
					.find({approved: true})
					.sort({UTC: 'asc'})
					.exec((err, results) => {
						if (err) throw err
						else if (results) {
							res.render('index', {
								manage: true,
								existing: true,
								list: results,
								result: results.length,
								user: user
							})
						} else {
							res.render('index', {
								manage: true,
								user: user
							})
						}
					})
			},
			() => {
				res.redirect('/')
			}
		)
	} catch (err) {
		console.log(err)
	}
})

router.get('/edit', (req, res) => {
	try {
		isAdmin.basic(
			req,
			res,
			user => {
				conferences.findOne({_id: req.query.id}, (err, result) => {
					if (err) throw err
					else if (result) {
						res.render('edit', {
							conference: result,
							user: user
						})
					} else {
						res.redirect('/')
					}
				})
			},
			() => {
				res.redirect('/')
			}
		)
	} catch (err) {
		console.log(err)
	}
})

router.get('/register', (req, res) => {
	isAdmin.level(
		req,
		res,
		1,
		user => {
			res.render('register', {
				user: user
			})
		},
		() => {
			res.redirect('/')
		}
	)
})

router.get('/submit', (req, res) => {
	isAdmin.level(
		req,
		res,
		2,
		user => {
			res.redirect('/add') // Send an admin to the add page instead
		},
		() => {
			res.render('submit')
		}
	)
})

router.get('/thanks', (req, res) => {
	isAdmin.basic(
		req,
		res,
		user => {
			res.render('thanks', {
				user: user
			})
		},
		() => {
			res.render('thanks')
		}
	)
})

module.exports = router
