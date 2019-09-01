const pug = require('pug')
const router = require('express').Router()
const uuid = require('uuid/v1')

var busboy = require('connect-busboy')
var fs = require('fs')
var path = require('path')
var async = require('async')

var isAdmin = require('./commands/privileges')
var models = require('./mongoose/models.js')
var person = models.person
var suggestion = models.suggestion
var conf = models.conference

router.get('/users/check', (req, res) => {
  var usr = person.findOne({ username: req.query.u })
  var eml = person.findOne({ email: req.query.e })
  function resolve (e, u) {
    if ((!e && !u) && (e, u != undefined)) res.send('200') // Available
    else if (!e && u) res.send('409') // "User taken"
    else if (e && !u) res.send('403') // "Email taken"
    else if (e && u) res.send('418') // "Email and user taken"
    else res.send('500') // Something broke, no idea what
  }
  async function handler () {
    const user = await usr
    const email = await eml
    return resolve(email, user)
  }
  handler()
})

router.get('/cleardb', (req, res) => {
  conf.find({}, (err, result) => {
    result.forEach((result) => {
      result.deleteOne()
    })
    res.redirect('./')
  })
})

router.get('/admin/grant', (req, res) => {
  isAdmin.basic(req, res, () => {
    function resolve (save) {
      if (save) res.send('200')
      else res.sendStatus(500)
    }
    async function handler () {
      if (req.query.add === 'true') {
        const eml = await person.findOne({ email: req.query.e })
        eml.isAdmin = req.query.level
        const save = await eml.save().then(() => {
          resolve(save)
        })
      } else {
        const eml = await person.findOne({ email: req.query.e })
        eml.isAdmin = 3
        const save = await eml.then(() => {
          resolve(save)
        })
      }
    }
    handler()
  })
})

module.exports = router
