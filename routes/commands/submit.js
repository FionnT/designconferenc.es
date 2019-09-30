const router = require('express').Router()
const busboy = require('connect-busboy')
const fs = require('fs')
const path = require('path')
const uuid = require('uuid/v1')

const isAdmin = require('./privileges')
const models = require('../mongoose/models.js')
const conferences = models.conference

router.post('/submit', busboy(), (req, res) => {
  req.pipe(req.busboy)

  const tmpDir = __dirname + '../../../static/img/tmp/'
  const confDir = __dirname + '../../../static/img/icons/conferences/'
  const formData = new Map() // Map inputs to their values
  let incoming

  const ext = () => {
    let t = incoming.image.split('.')
    return t[t.length - 1].toString()
  }

  const rename = async (tmp, nu) => {
    fs.rename(tmp, nu, function(err) {
      if (err) console.log(err)
    })
  }

  // Editing page is just the suggest page, modified slightly
  // We're not wrapping the entire request so that we can process a request as a suggestion if they're not an admin

  const dbStore = async (admin) => {
    let n = new Date().getTime()
    try {
      await new Promise((resolve, reject) => {
        conferences.findById(incoming.id, (err, result) => {
          if (err) reject(err)
          else {
            if (n > incoming.utc) reject("That date doesn't make sense!")
            else {
              if (admin) incoming.approved = true
              else if (!admin) incoming.approved = false // Sneaky buggers
              if (result) {
                // approving or modifying a conference
                Object.assign(result, incoming) // set values of existing conference to incoming details
                result
                  .save()
                  .then(() => {
                    resolve()
                  })
                  .catch((err) => reject(err))
              } else {
                // new submission
                let uData = new conferences(incoming)
                uData
                  .save()
                  .then(() => {
                    resolve()
                  })
                  .catch((err) => reject(err))
              }
            }
          }
        })
      })
    } catch (err) {
      console.log(err)
    }
  }

  const fileStore = async () => {
    // don't run if no file was submitted
    if (incoming.image) {
      let nameVar = uuid() + incoming.title.replace(/ /g, '') + '.' + ext()
      let tmpName = path.join(tmpDir + incoming.image)
      let newName
      try {
        await new Promise((resolve, reject) => {
          conferences.findById(incoming.id, (err, result) => {
            if (result && result.image) {
              // updating file => overwrite existing
              newName = path.join(
                confDir + result.image.split('/conferences/')[1].split("'")[0]
              )
              rename(tmpName, newName)
              resolve()
            } else {
              // new submission, or no existing image => generate file name
              newName = path.join(confDir + nameVar)
              rename(tmpName, newName)
              incoming.image = "'./" + newName.split('/static/')[1] + "'"
              resolve()
            }
          })
        })
      } catch (err) {
        console.log(err)
      }
    } else return true
  }

  // Parse the string from FormData format back into JSON
  req.busboy.on('field', (fieldname, val) => {
    formData.set(fieldname, val)
    incoming = JSON.parse(formData.get('data'))
  })

  req.busboy.on('file', (fieldname, file, fileName) => {
    new Promise((resolve, reject) => {
      const fstream = fs.createWriteStream(path.join(tmpDir, fileName))
      file.pipe(fstream).on('finish', () => {
        resolve()
      })
      newFile = true
    })
  })

  req.busboy.on('finish', () => {
    function resolve(err) {
      if (err) res.send(err)
      else {
        res.sendStatus(200)
        res.end()
      }
    }

    async function handler(admin) {
      await fileStore()
      await dbStore(admin)
    }

    isAdmin.basic(
      req,
      res,
      (user) => {
        handler(true)
          .then(() => {
            resolve()
          })
          .catch((err) => {
            resolve(err)
          })
      },
      () => {
        handler(false)
          .then(() => {
            resolve()
          })
          .catch((err) => {
            resolve(err)
          })
      }
    )
  })
})

module.exports = router
