const models = require('../mongoose/models.js');
const person = models.person;


module.exports = {
  basic: function (req, res, _success, _fail) {
    console.log(req.cookies.UID)
    person.findOne({ _id: req.cookies.UID }, (err, user) => {
      if (user != null && user.isAdmin>=0) _success(user);
      else if (_fail !== undefined) {
        if (typeof(_fail) === 'function') _fail();
        else return _fail
      }
    })
  },
  level: function (req, res, level, _success, _fail) {
    person.findOne({ _id: req.cookies.UID }, (err, user) => {
      if (user != null && user.isAdmin <= level) _success(user);
      else if (_fail !== undefined) {
        if (typeof(_fail) === 'function') _fail();
        else return _fail
      }
    })
  }
};