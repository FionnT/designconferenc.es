const router = require('express').Router()
const isAdmin = require('./privileges')
const models = require('../mongoose/models.js')
const conf = models.conference

router.get('/accept', (req, res) => {
  const approve = async () => {
    try {
      await conf.findById(req.query.id, (err, result) => {
        result.approved = true
        result
          .save()
          .then(() => {
            return true
          })
          .catch((err) => {
            console.log(err)
          })
      })
    } catch (error) {
      console.log(error)
    }
  }

  async function handler() {
    await approve()
  }

  isAdmin.basic(
    req,
    res,
    () => {
      console.log(req.query)
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
