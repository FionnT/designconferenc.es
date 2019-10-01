const router = require('express').Router()

const models = require('../mongoose/models')
const conferences = models.conference

function isEmpty(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) return false
  }
  return true
}

router.get('/search', (req, res) => {
  let raw = []
  let query = {}
  let helper
  let place
  let time
  let name

  const search = async (filter, field) => {
    try {
      await new Promise((resolve, reject) => {
        query[field] = {$regex: filter, $options: 'i'} // Result: {field: { "$regex": filter, "$options": "i" }}
        conferences.find(query, function(err, results) {
          if (err) reject(err)
          else {
            results.forEach((item) => raw.push(item))
            resolve()
          }
        })
      })
      query = {} // empty query after each search
    } catch (err) {
      console.log(err)
    }
  }

  const filter = async () => {
    try {
      await new Promise((resolve, reject) => {
        const result = [...new Set(raw.map((obj) => JSON.stringify(obj)))].map(
          (str) => JSON.parse(str)
        ) // removing duplicates from the raw array
        helper = result.splice(0) // cloning the constant so we can edit it
        const parse = (search, field) => {
          let regex = new RegExp(search, 'ig')
          b = helper.filter((item) => item[field].match(regex)) // keep only those that match search
          helper = b // set master array equal to filtered array
        }
        if (place) parse(place, 'country')
        if (time) parse(time, 'text_date')
        if (name) parse(name, 'title')
        resolve()
      })
    } catch (err) {
      console.log(err)
    }
  }

  function resolve(blank_search) {
    if (blank_search) res.redirect('/')
    if (!blank_search && !helper.length) res.render('index', {list: false})
    // no results found for search
    else
      res.render('index', {
        list: helper,
        result: helper.length
      })
  }
  async function handler() {
    if (!place && !time && !name) resolve(true)
    if (place) await search(place, 'country')
    if (time) await search(time, 'text_date')
    if (name) await search(name, 'title')
    await filter()
  }

  if (isEmpty(req.query)) resolve(true)
  else {
    place = req.query.country.toString()
    if (place === 'Worldwide') place = false
    time = req.query.month.toString()
    if (time === 'Any') time = false
    name = req.query.title.toString()
    if (name === 'Any') name = false
    handler().then(() => {
      resolve(false)
    })
  }
})

module.exports = router
