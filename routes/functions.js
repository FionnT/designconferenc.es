const router = require('express').Router();

const isAdmin = require('./commands/privileges.js');
const models = require('./mongoose/models.js');
const person = models.person;

// No processing required

router.get('/failed', (req, res) => res.send('Failed'));
router.get('/users', (req, res) => res.render('users'));
router.get('/404', (req, res) => res.render('404'));


router.get('/cleardb', (req, res) => {
  person.find({}, (err, result) => {
    result.forEach((result) => {
      result.deleteOne()
    });
    res.redirect('./')
  })
});


module.exports = router;
