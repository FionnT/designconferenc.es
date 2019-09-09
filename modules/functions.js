const router = require('express').Router();

let models = require('./mongoose/models.js');
let person = models.person;
let suggestion = models.suggestion;


router.get('/cleardb', (req, res) => {
  suggestion.find({}, (err, result) => {
    result.forEach((result) => {
      result.deleteOne()
    });
    res.redirect('./')
  })
});


module.exports = router;
