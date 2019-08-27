const pug = require('pug')
const router = require('express').Router()
const busboy = require('connect-busboy')
const fs = require('fs')
const path = require('path')
const async = require('async')
const uuid = require('uuid/v1')
const passport = require('passport')
const bcrypt = require('bcrypt')
const cookie = require('cookie')
const saltRounds = 10

var models = require('../mongoose/models.js')
var person = models.person
var isAdmin = require('./privileges')

router.post('/register', busboy({ immediate: true }), (req, res) => {
  req.pipe(req.busboy)

  var user = undefined
  var admin = undefined
  var messages = ['User is registered!', 'Email is already taken', 'Username is already taken', 'Email and username are taken', 'You don\'t have the permissions to do that.']
  var message = messages[0]
  var unique = true

  var tmpDir = __dirname + '../../../static/img/tmp/'
  const formData = new Map() // Map inputs to their values

  var existCheck = () => {
    var problem = 0
    return new Promise((resolve, reject) => {
      var uid = ['email', 'username']
      var info = [user.email, user.username]
      for (i = 0; i < 2; i++) {
        var query = {}
        query[uid[i]] = info[i] // result: {email: email@place.com}
        person.find(query, function (err, result) {
          if (result.length != 0) {
            unique = false
            if (result[0].email === user.email) problem += 1
            if (result[0].username === user.username) problem += 2
            message = messages[problem]
          }
        })
      }
      resolve()
    })
  }

  var userSave = (allowed) => {
    if (allowed) {
      return new Promise((resolve, reject) => {
        var pass = user.password
        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(pass, salt, function (err, hash) {
            user.password = hash
            var uData = new person(user)
            uData.save()
              .then(() => {
                resolve()
              })
              .catch(err => {
                console.log(err)
              })
            resolve()
          })
        })
      })
    } else { () => { resolve() } }
  }

  var fileSave = () => {
    if (unique) {
      return new Promise((resolve, reject) => {
        if (user.filename) { // don't run if there's no file
          function ext () {
            var t = user.filename.split('.')
            return (t[t.length - 1]).toString()
          }
          var tmpName = path.join(tmpDir + user.filename)

          // Use these on Mac or Linux
          // ---
          var newName = path.join(__dirname + '../../../static/img/profiles/' + uuid() + user.name.replace(/ /g, '') + '.' + ext())
          user.filename = "'./" + newName.split('/static/')[1] + "'"

          // Use these on Windows
          // ---
          // var newName = path.join(__dirname + '..\\..\\..\\static\\img\\profiles\\' + uuid() + user.name.replace(/ /g, "") + "." + ext());
          // user.filename = "'./img/profiles/" + newName.split("\\profiles\\")[1] + "'"

          fs.rename(tmpName, newName, function (err) {
            if (err) {
              console.log('ERROR: ' + err)
              reject()
              res.sendStatus(500)
            } else {
              resolve()
            }
          })
        } else { () => { resolve() } }
      })
    } else { () => { resolve() } }
  }

  req.busboy.on('field', (fieldname, val, ext) => {
    formData.set(fieldname, val)
    user = JSON.parse(formData.get('data'))
  })

  req.busboy.on('file', (fieldname, file, fileName) => {
    var fstream = fs.createWriteStream(path.join(tmpDir + fileName))
    file.pipe(fstream)
    fstream.on('close', function () {
      return true // ehhh
    })
  })

  req.busboy.on('finish', () => {
    function resolve () {
      res.send(message)
    }
    async function handler () {
      const exists = await existCheck()
      const file = await fileSave(unique)
      const user = await userSave(unique)
      return resolve()
    }
    handler()
  })
})

module.exports = router
