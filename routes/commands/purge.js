const router = require('express').Router()
const busboy = require('connect-busboy')
const fs = require('fs')
const path = require('path')

const isAdmin = require('./privileges')
const models = require('../mongoose/models.js')
const suggestion = models.suggestion
const conf = models.conference

router.post('/purge', busboy(), (req, res) => {
  req.pipe(req.busboy)

  let id
  let type
  let conference
  const formData = new Map() // Map inputs to their values

  req.busboy.on('field', (fieldname, val) => {
    formData.set(fieldname, val)
    conference = JSON.parse(formData.get('data'))
    id = conference.id
    type = conference.type
  })

  const filePurge = async () => {
    try {
      await new Promise((resolve, reject) => {
        function clean(err, result) {
          if (err) reject()
          else {
            let image = result.image
            if (image) {
              let file = path.join(
                __dirname +
                  '../../../static/' +
                  image.split('./')[1].split("'")[0]
              )
              fs.unlink(file, () => {
                resolve()
              })
            } else resolve()
          }
        }

        if (type === 'suggestion')
          suggestion.findOne({ _id: id }, (err, result) => {
            clean(err, result)
          })
        else if (type === 'conference')
          conf.findOne({ _id: id }, (err, result) => {
            clean(err, result)
          })
      })
    } catch (error) {
      console.log(error)
    }
  }
  const dbPurge = async () => {
    try {
      await new Promise((resolve, reject) => {
        function clean(err, result) {
          if (err) reject()
          else {
            result.remove()
            resolve()
          }
        }

        if (type === 'suggestion')
          suggestion.findOne({ _id: id }, (err, result) => {
            clean(err, result)
          })
        else if (type === 'conference')
          conf.findOne({ _id: id }, (err, result) => {
            clean(err, result)
          })
      })
    } catch (error) {
      console.log(error)
    }
  }

  req.busboy.on('finish', () => {
    function resolve() {
      res.sendStatus(200)
      res.end()
    }
    async function handler() {
      await filePurge()
      await dbPurge()
    }
    isAdmin.basic(
      req,
      res,
      () => {
        handler().then(() => {
          resolve()
        })
      },
      () => {
        res.sendStatus(403)
      }
    )
  })
})

module.exports = router
