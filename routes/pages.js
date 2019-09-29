const router = require('express').Router()
const isAdmin = require('./commands/privileges.js')
const models = require('./mongoose/models.js')
const person = models.person
const conf = models.conference
const suggestion = models.suggestion
const ping = require('request')

// No processing required

router.get('/failed', (req, res) => res.send('Failed'))
router.get('/404', (req, res) => res.render('404'))

// Processing required

router.get('/', (req, res) => {
  ping.post('http://localhost:3000/prim')
  person.findOne(
    {
      _id: req.cookies.UID
    },
    (err, user) => {
      conf
        .find({})
        .sort({UTC: 'asc'})
        .exec((err, conferences) => {
          if (conferences.length !== 0) {
            res.render('index', {
              list: conferences,
              user: user
            })
          } else {
            res.render('index', {
              user: user
            })
          }
        })
    }
  )
})

router.get('/add', (req, res) => {
  isAdmin.basic(
    req,
    res,
    (user) => {
      res.render('suggest', {
        user: user
      })
    },
    () => {
      res.redirect('/suggest')
    }
  )
})

router.get('/admin', (req, res) => {
  isAdmin.level(
    req,
    res,
    2,
    (user) => {
      person.find({}, (err, users) => {
        res.render('admin', {
          user: user,
          users: users
        })
      })
    },
    () => {
      res.redirect('/')
    }
  )
})

router.get('/approve', (req, res) => {
  isAdmin.basic(
    req,
    res,
    (user) => {
      suggestion
        .find({})
        .sort({UTC: 'asc'})
        .exec((err, conferences) => {
          if (conferences) {
            res.render('index', {
              manage: true,
              list: conferences,
              result: conferences.length,
              user: user
            })
          } else {
            res.render('index', {
              manage: true,
              list: false,
              result: false,
              user: user
            })
          }
        })
    },
    () => {
      res.redirect('/')
    }
  )
})

router.get('/manage', (req, res) => {
  isAdmin.basic(
    req,
    res,
    (user) => {
      conf
        .find({})
        .sort({UTC: 'asc'})
        .exec((err, conferences) => {
          if (conferences) {
            res.render('index', {
              manage: true,
              list: conferences,
              result: conferences.length,
              user: user
            })
          } else {
            res.render('index', {
              manage: true,
              list: false,
              result: false,
              user: user
            })
          }
        })
    },
    () => {
      res.redirect('/')
    }
  )
})

router.get('/register', (req, res) => {
  isAdmin.level(
    req,
    res,
    1,
    (user) => {
      res.render('register', {
        user: user
      })
    },
    () => {
      res.redirect('/')
    }
  )
})

router.get('/suggest', (req, res) => {
  isAdmin.level(
    req,
    res,
    2,
    (user) => {
      res.redirect('/add') // Send an admin to the add page instead
    },
    () => {
      res.render('suggest')
    }
  )
})

router.get('/thanks', (req, res) => {
  isAdmin.basic(
    req,
    res,
    (user) => {
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
