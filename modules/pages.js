const router = require('express').Router()

let isAdmin = require('./commands/privileges');
let models = require('./mongoose/models.js');
let person = models.person;
let suggestion = models.suggestion;
let conf = models.conference;

// No processing required

router.get('/failed', (req, res) => res.send('Failed'));
router.get('/users', (req, res) => res.render('users'));
router.get('/404', (req, res) => res.render('404'));
router.get('/thanks', (req, res) => res.render('thanks'));

// Processing required

router.get('/', (req, res) => {
  person.findOne({ _id: req.cookies.UID }, (err, user) => {
    conf.find({}, function (err, conferences) {
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
  })
});

router.get('/approve', (req, res) => {
  isAdmin.basic(req, res, (user) => {
    suggestion.find({}, (err, suggestions) => {
      if (suggestions) {
        res.render('index', {
          manage: true,
          list: suggestions,
          result: suggestions.length,
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
  })
});



router.get('/register', (req, res) => res.render('register'))
router.get('/admin', (req, res) => person.find({}, (err, users) => {
  res.render('admin', {
    users: users
  })
}));

// router.get('/register', (req, res) => {
//   isAdmin.level(req, res, 2, (user) => {
//     res.render('register', {
//       isAdmin: user.isAdmin,
//       user: user
//     }) // Send an admin to the add page instead
//   }, () => {
//     res.redirect('404')
//   })
// })

router.get('/admin', (req, res) => {
  isAdmin.level(req, res, 0, (user) => {
    res.render('admin', {
      user: user
    })
  }, () => { res.redirect('/') })
});

router.get('/suggest', (req, res) => {
  isAdmin.level(req, res, 2, (user) => {
    res.render('suggest', {
      isAdmin: user.isAdmin,
      user: user
    }) // Send an admin to the add page instead
  }, () => {res.render('suggest')})
});

router.get('/add', (req, res) => {
  isAdmin.basic(req, res, (user) => {
    res.render('suggest', {
      isAdmin: user.isAdmin,
      user: user
    })
  }, () => {
    res.redirect('/suggest')
  })
});

module.exports = router;
