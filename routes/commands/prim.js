const router = require('express').Router()
const models = require('../mongoose/models')
const conf = models.conference
const sug = models.suggestion

router.post('/prim', (req, res) => {
  conf.find({}, (err, result) => {
    result.forEach((item) => {
      // do UTC time conversion
      let n = new Date().getTime()
      if (!item.UTC) {
        let y0 = item.start_date.year
        let m0 = item.start_date.month
        let d0 = item.start_date.date
        let y1 = item.end_date.year
        let m1 = item.end_date.month
        let d1 = item.end_date.date

        let s = Date.UTC(y0, m0, d0)
        let e = Date.UTC(y1, m1, d1)

        if (s > e) item.UTC = s
        else item.UTC = e
        item.save()
      } else if (item.UTC < n) item.remove()
    })
  })

  sug.find({}, (err, result) => {
    result.forEach((item) => {
      // do UTC time conversion
      let n = new Date().getTime()
      if (!item.UTC) {
        let y0 = item.start_date.year
        let m0 = item.start_date.month
        let d0 = item.start_date.date
        let y1 = item.end_date.year
        let m1 = item.end_date.month
        let d1 = item.end_date.date

        let s = Date.UTC(y0, m0, d0)
        let e = Date.UTC(y1, m1, d1)

        if (s > e) item.UTC = s
        else item.UTC = e
        item.save()
      } else if (item.UTC < n) item.remove()
    })
  })
})

module.exports = router
