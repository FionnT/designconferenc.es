const pug = require('pug')
const router = require('express').Router()
const busboy = require('connect-busboy')
const fs = require('fs')
const path = require('path')
const async = require('async')
const uuid = require('uuid/v1')

var isAdmin = require('./privileges')
var models = require('../mongoose/models.js')
var suggestion = models.suggestion
var conf = models.conference

router.post('/submit', busboy({ immediate: true }), (req, res) => {
  req.pipe(req.busboy)

  var conference = undefined
  var tmpDir = __dirname + '../../../static/img/tmp/'
  var pendingDir = __dirname + '../../../static/img/icons/pending/'
  var newName = undefined
  var privileged = true // NOTE: PLEASE CHANGE TO FALSE BEFORE PUBLISHING
  const formData = new Map() // Map inputs to their values


  // Admin manual add page just renders the suggest page and then posts data to this route
  // We're not wrapping the entire request because it should process as a suggestion if they're not
  var privileges = () => {
    return new Promise((resolve, reject) => {
      isAdmin.basic(req, res, () => {
        privileged = true
        resolve()
      }, resolve()) // prevent default
    })
  }

  var fileStore = (admin) => {
    return new Promise((resolve, reject) => {
      if (conference.image) { // don't run if there's no file
        function ext () {
          var t = conference.image.split('.')
          return (t[t.length - 1]).toString()
        }

        if (conference.approve) {
          var tmpName = path.join(pendingDir + conference.image)
          delete conference.approve
        } else var tmpName = path.join(tmpDir + conference.image)

        var nameVar = uuid() + conference.title.replace(/ /g, '') + '.' + ext()

        if (admin) newName = path.join(__dirname + '../../../static/img/icons/approved/' + nameVar)
        else newName = path.join(pendingDir + nameVar)

        conference.image = "'./" + newName.split('/static/')[1] + "'"
        fs.rename(tmpName, newName, function (err) {
          if (err) {
            console.log('ERROR: ' + err)
            reject()
            res.sendStatus(500)
          } else {
            resolve()
          }
        })
      } else resolve() // no file, no problem
    })
  }

  var dbStore = (admin) => {
    return new Promise((resolve, reject) => {
      if (admin) var uData = new conf(conference)
      else var uData = new suggestion(conference)
      uData.save()
        .then(() => {
          resolve()
        })
        .catch(err => {
          res.sendStatus(500)
          console.log(err)
          reject()
        })
    })
  }
  // Parse the string from FormData format back into JSON
  req.busboy.on('field', (fieldname, val, ext) => {
    formData.set(fieldname, val)
    conference = JSON.parse(formData.get('data'))
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
      res.sendStatus(200)
      res.end()
    }
    async function handler () {
      const admin = await privileges()
      const file = await fileStore(privileged)
      const save = await dbStore(privileged)

      return resolve()
    }
    handler()
  })
})

module.exports = router
