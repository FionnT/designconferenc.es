const router = require('express').Router();
const busboy = require('connect-busboy');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');

const isAdmin = require('./privileges');
const models = require('../mongoose/models.js');
const suggestion = models.suggestion;
const conf = models.conference;

router.post('/submit', busboy(), (req, res) => {
  req.pipe(req.busboy);

  const tmpDir = __dirname + '../../../static/img/tmp/';
  const pendingDir = __dirname + '../../../static/img/icons/pending/';
  const approvedDir = __dirname + '../../../static/img/icons/approved/';
  const formData = new Map(); // Map inputs to their values

  let conference;
  let newName;
  let tmpName;
  let newFile; 

  // Admin manual add page just renders the suggest page and then posts data to this route
  // We're not wrapping the entire request because it should process as a suggestion if they're not
  // an admin or other user
  // also used for the management page 

  function ext () {
    let t = conference.image.split('.');
    return (t[t.length - 1]).toString()
  }

  const rename = async (tmp, nu, _catch) => {
    fs.rename(tmp, nu, function (err) {
      if (err) console.log(err)
    })
  }

  const fileStore = async (admin) => {
    if (conference.image) { // don't run if there's no file
      try{ 
        await new Promise((resolve, reject) => {
          let nameVar = uuid() + conference.title.replace(/ /g, '') + '.' + ext();
          if (!conference.approve && conference.id && admin) { // modifying live conference 
            conf.findById(conference.id, (err, result) => {
              tmpName = path.join(tmpDir + conference.image); // overwrite existing 
              newName =  path.join(approvedDir + result.image.split("/approved/")[1].split("'")[0]);
              rename(tmpName, newName)
              resolve();
            })
          } else if (admin) {  
            newName = path.join(approvedDir + nameVar);
            if(newFile) tmpName = path.join(tmpDir + conference.image); 
            else tmpName = path.join(pendingDir + conference.image); // straight approval
            rename(tmpName, newName) 
            conference.image = "'./" + newName.split("/static/")[1] + "'"
            resolve();
          } else { // user suggestion 
            tmpName = path.join(tmpDir + conference.image);
            newName = path.join(pendingDir + nameVar);
            rename(tmpName, newName)
            conference.image = "'./" + newName.split("/static/")[1] + "'"
            resolve();
          }
        });
      }catch (error) { console.log(error)}
    } else return true;
  };

  const dbStore = async (admin) => {
    try{ 
      await new Promise((resolve, reject) => {
        let uData;
        if (!conference.approve && conference.id && admin) { // modifying live conference 
          conf.findById(conference.id, (err, result) => {
            result.title = conference.title;
            result.text_date = conference.date;
            result.country = conference.country;
            result.city = conference.city;
            result.description = conference.description;
            result.website = conference.website; 
            result.save()
              .then(() => {
                resolve();
              })
              .catch(err => {
                console.log(err);
              });
            resolve(); // fallback
          })
          
        }else if (admin) { // adding a conference directly 
          uData = new conf(conference); 
          if(conference.approve) { // approving a suggestion
            console.log(conference.id)
            suggestion.findById(conference.id, (err, result) => {result.remove()})
            delete conference.approve
          }
          delete conference.id; 
        } else uData = new suggestion(conference); // user suggestion 

        uData.save()
        .then(() => {
          resolve()
        })
        .catch(err => {
          res.sendStatus(500);
          console.log(err);
          reject()
        })

      })
    }catch (error) { console.log(error)}
  };

  // Parse the string from FormData format back into JSON
  req.busboy.on('field', (fieldname, val) => {
    formData.set(fieldname, val);
    conference = JSON.parse(formData.get('data'))
  });

  req.busboy.on('file', (fieldname, file, fileName) => {
    new Promise ((resolve, reject) => {
      const fstream = fs.createWriteStream(path.join(tmpDir, fileName));
      file.pipe(fstream).on('finish', () => { resolve() })
      newFile = true;
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
