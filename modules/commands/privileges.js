var models = require('../mongoose/models.js')
var person = models.person
const router = require('express').Router()

module.exports = {
  basic: function (req, res, _success, _fail) {
    person.findOne({ _id: req.cookies.UID }, (err, user) => {
      if (user != null && user.isAdmin) _success(user)
      else
      if (_fail != undefined) {
        if (typeof (_fail) === 'function') _fail()
        else _fail
      }
    })
  },
  level: function (req, res, level, _success, _fail) {
    person.findOne({ _id: req.cookies.UID }, (err, user) => {
      if (user != null && user.isAdmin <= level) _success(user)
      else
      if (_fail != undefined) {
        if (typeof (_fail) === 'function') _fail()
        else _fail
      }
    })
  }
}
