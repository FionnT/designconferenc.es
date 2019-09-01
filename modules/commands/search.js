const pug = require('pug')
const router = require('express').Router()
const async = require('async')

var isAdmin = require('./privileges')
var models = require('../mongoose/models.js')
var conf = models.conference

router.get('/search', (req, res) => {
  var raw = []
  var helper = undefined
  var query = {}

  var search = (filter, field) => {
    return new Promise((resolve, reject) => {
      query[field] = { $regex: filter, $options: 'i' } // Result: var query = {field: { "$regex": filter, "$options": "i" }}
      conf.find(query, function (err, conferences) {
        for (i in conferences) raw.push(conferences[i])
        resolve()
      })
    }).then(query = {}) // empty query after each search
  }

  var filter = () => {
    return new Promise((resolve, reject) => {
      const result = [...new Set(raw.map(obj => JSON.stringify(obj)))].map(str => JSON.parse(str)) // removing duplicates from the raw array
      helper = result.splice(0) // cloning the constant so we can edit it
      console.log(helper)
      function run () {
        for (i = 0; i < helper.length; i++) {
          function parse (a, b) {
            var regex = new RegExp(a, 'ig')
            var res = helper[i][b].match(regex)
            if (!res) {
              if (helper.length === 1) { // can't splice a 1 length string
                helper = []
                resolve()
              } else helper.splice(i, i); run() // need to reset the stored helper.length after each splice, or it won't check every item
            }
          }
          if (name) parse(name, 'title')
          if (time) parse(time, 'text_date')
          if (place) parse(place, 'country')
        }
        resolve()
      }
      if (helper.length != 0) run()
      else resolve()
    }).then(run = undefined)
    // .catch(
    //   res.render('index', {
    //     list: false
    //   })
    // ) // prevent stack size exceptions
  }

  function isEmpty (obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false
    }
    return true
  }

  function resolve (blank) {
    if (blank) res.redirect('/') //  Lists all by default
    if (!blank && helper.length === 0) res.render('index', { list: false })
    else {
      res.render('index', {
        list: helper,
        result: helper.length
      })
    }
  }
  async function handler () {
    if ((!place && !time) && !name) resolve(true)
    if (place) { const a = await search(place, 'country') };
    if (time) { const b = await search(time, 'text_date') };
    if (name) { const c = await search(name, 'title') };
    const d = await filter()
    return resolve(false)
  }

  if (isEmpty(req.query)) resolve(true)
  else {
    var place = req.query.country.toString()
    if (place === 'Worldwide') place = false
    var time = req.query.month.toString()
    if (time === 'Any') time = false
    var name = req.query.title.toString()
    if (name === 'Any') name = false
    handler()
  }
})

module.exports = router
