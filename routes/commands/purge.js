const router = require('express').Router()
const fs = require('fs')
const path = require('path')

const isAdmin = require('./privileges')
const models = require('../mongoose/models.js')
const conferences = models.conference

router.get('/purge', (req, res) => {
  const filePurge = async () => {
    try {
      await new Promise((resolve, reject) => {
        conferences.findOne({_id: req.query.id}, (err, result) => {
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
        })
      })
    } catch (err) {
      console.log(err)
    }
  }
  const dbPurge = async () => {
    try {
      await new Promise((resolve, reject) => {
        conferences.findOne({_id: req.query.id}, (err, result) => {
          if (err) reject()
          else {
            result.remove()
            resolve()
          }
        })
      })
    } catch (error) {
      console.log(error)
    }
  }

  async function handler() {
    await filePurge()
    await dbPurge()
  }
  console.log(req)
  isAdmin.basic(
    req,
    res,
    () => {
      handler().then(() => {
        res.redirect('/' + req.query.return)
      })
    },
    () => {
      res.redirect('/404')
    }
  )
})

module.exports = router
