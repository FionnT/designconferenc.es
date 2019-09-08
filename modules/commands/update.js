const pug = require('pug')
const router = require('express').Router()
const busboy = require('connect-busboy')
const fs = require('fs')
const path = require('path')
const async = require('async')
const bcrypt = require('bcrypt')

const saltRounds = 10

var models = require('../mongoose/models.js')
var person = models.person
var isAdmin = require('./privileges')

router.post('/register', busboy({ immediate: true }), (req, res) => {
  isAdmin.level(req, res, 1, (requestor) => {
    req.pipe(req.busboy)

    var updated
    var original
    var unique = true
    var messages = ['Details were updated!', 'Email is already taken', 'Username is already taken', 'Email and username are taken', 'You don\'t have the permissions to do that.']
    var message = messages[0]

    const formData = new Map() // Map inputs to their values

    var existCheck = () => {
      return new Promise((resolve, reject) => {
        var problem = 0
        var uid = ['email', 'username']
        var info = [updated.email, updated.username]
        for (i = 0; i < 2; i++) {
          var query = {}
          query[uid[i]] = info[i] // Output: query = {email: updated.email}
          person.find(query, function (err, result) {
            if (result.length > 1) {
              // We should only fault an identifier, if there's more than one
              if (result[0].email === updated.email && result[1].email === updated.email) problem += 1
              if (result[0].username === updated.username && result[1].username === updated.username) problem += 2
              message = messages[problem]
              unique = false
            }else original = result // caching returned user
          })
        }
        resolve()
      })
    }

    var passUpdate () -> {
      return new Promise((resolve, reject) => {
        if(updated.password){ // set to false on client side if we're not updating it
          bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(updated.password, salt, function (err, hash) {
              updated.password = hash
              resolve()
            })
          })
        }else {
          res.send('You don\'t have the permissions to do that.')
          res.end()
          reject()
        }
      })
    }

    var fileSave = () => {
      return new Promise((resolve, reject) => {
        if (updated.filename) { // set to false on client side if we're not updating it

          var tmpDir = __dirname + '../../../static/img/tmp/'
          var tmpName = path.join(tmpDir + updated.filename)
          var newName = path.join(__dirname + '../../../static/' + original.filename) // No need to generate a new UUID, we're just going to overwrite

          updated.filename = original.filename

          fs.rename(tmpName, newName, function (err) {
            if (err) {
              console.log('ERROR: ' + err)
              reject()
              res.sendStatus(500)
              res.end()
            } else {
              resolve()
            }
          })

        } else { () => { resolve() } }
      })
    }

    var userUpdate = () => {
      return new Promise((resolve, reject) => {
        
      })
    }


    req.busboy.on('field', (fieldname, val, ext) => {
      formData.set(fieldname, val)
      updated = JSON.parse(formData.get('data'))
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
        const exists = await existCheck() // this also stores the returned user in 'original' var
        if(unique){
          const user = await passUpdate()
          const file = await fileSave()
          const save = await userUpdate()
        }
        return resolve()
      }
      handler()
    })

  }, () => {
    res.send('You don\'t have the permissions to do that.')
  })
})

module.exports = router
