const router = require('express').Router()

const models = require('../mongoose/models.js')
const conf = models.conference

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
        query[field] = {$regex: filter, $options: 'i'} // Result: var query = {field: { "$regex": filter, "$options": "i" }}
        conf.find(query, function(err, conferences) {
          conferences.forEach((item) => raw.push(item))
          resolve()
        })
      })
      query = {} // empty query after each search
    } catch (error) {
      console.log(error)
    }
  }

  const filter = async () => {
    try {
      await new Promise((resolve, reject) => {
        const result = [...new Set(raw.map((obj) => JSON.stringify(obj)))].map(
          (str) => JSON.parse(str)
        ) // removing duplicates from the raw array
        helper = result.splice(0) // cloning the constant so we can edit it
        function run() {
          for (let i = 0; i < helper.length; i++) {
            function parse(a, b) {
              // Loop through array we made earlier, and remove anything that doesn't match the search terms
              let regex = new RegExp(a, 'ig')
              let res = helper[i][b].match(regex)
              if (!res) {
                if (helper.length === 1) {
                  // can't splice a 1 length string
                  helper = []
                  resolve()
                } else helper.splice(i, 1)
                run() // need to reset the stored helper.length after each splice, or it won't check every item
              }
            }
            if (name) parse(name, 'title')
            if (time) parse(time, 'text_date')
            if (place) parse(place, 'country')
          }
          resolve()
        }
        if (helper.length >= 1) {
          run()
        } else resolve() // prevent stack size exceptions}
      }).then(() => {
        run = undefined
      })
    } catch (error) {
      console.log(error)
    }
  }

  function resolve(blank) {
    if (blank) res.redirect('/') //  Lists all by default
    if (!blank && helper.length === 0) res.render('index', {list: false})
    else {
      res.render('index', {
        list: helper,
        result: helper.length
      })
    }
  }
  async function handler() {
    if (!place && !time && !name) resolve(true)
    if (place) {
      await search(place, 'country')
    }
    if (time) {
      await search(time, 'text_date')
    }
    if (name) {
      await search(name, 'title')
    }
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
