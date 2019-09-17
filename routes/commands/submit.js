const router = require('express').Router();
const busboy = require('connect-busboy');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');

const isAdmin = require('./privileges');
const models = require('../mongoose/models.js');
const person = models.person;
const suggestion = models.suggestion;
const conf = models.conference;

router.post('/submit', busboy({ immediate: true }), (req, res) => {
  req.pipe(req.busboy);

  const tmpDir = __dirname + '../../../static/img/tmp/';
  const pendingDir = __dirname + '../../../static/img/icons/pending/';
  const formData = new Map(); // Map inputs to their values

  let conference;
  let newName;
  let tmpName;

  // Admin manual add page just renders the suggest page and then posts data to this route
  // We're not wrapping the entire request because it should process as a suggestion if they're not
  // an admin or other user

  const fileStore = async (admin) => {
    await new Promise((resolve, reject) => {
      try {
        if (conference.image) { // don't run if there's no file
          function ext () {
            let t = conference.image.split('.');
            return (t[t.length - 1]).toString()
          }

          let nameVar = uuid() + conference.title.replace(/ /g, '') + '.' + ext();

          if (conference.approve && admin) {
            tmpName = join(pendingDir + conference.image);
            newName = join(__dirname + '../../../static/img/icons/approved/' + nameVar);
            delete conference.approve
          } else {
            tmpName = join(tmpDir + conference.image);
            newName = join(pendingDir + nameVar);
          }

          conference.image = "'./" + newName.split('/static/')[1] + "'";

          rename(tmpName, newName, function (err) {
            if (err) {
              console.log('ERROR: ' + err);
              reject();
              res.sendStatus(500)
            } else {
              resolve()
            }
          })
        } else resolve() // no file, no problem
      }catch { reject(error) }
    })
  };

  const dbStore = async (admin) => {
    await new Promise((resolve, reject) => {
      try {
        let uData;
        if (admin) {
          uData = new conf(conference);

          suggestion.findOne({id: conference._id}, (err, result) => {
            if (err) reject()
            else if(result) result.deleteOne()
          })

        }
        else uData = new suggestion(conference);
        uData.save()
          .then(() => {
            resolve()
          })
          .catch(err => {
            res.sendStatus(500);
            console.log(err);
            reject()
          })
      } catch {
        reject(error)
      } 
    })
  };

  // Parse the string from FormData format back into JSON
  req.busboy.on('field', (fieldname, val) => {
    formData.set(fieldname, val);
    conference = JSON.parse(formData.get('data'))
  });

  req.busboy.on('file', (fieldname, file, fileName) => {
    const fstream = createWriteStream(join(tmpDir + fileName));
    file.pipe(fstream);
    fstream.on('close', function () {
      return true
    })
  });

  req.busboy.on('finish', () => {

    function resolve () {
      res.sendStatus(200);
      res.end()
    }

    async function handler (admin) {
      await fileStore(admin);
      await dbStore(admin)
    }

    isAdmin.basic(req, res, (user) => {
      handler(true).then( ()=> {resolve() })
    }, () => {
      handler(false).then( ()=> {resolve() })
    })

  })
});

module.exports = router;
