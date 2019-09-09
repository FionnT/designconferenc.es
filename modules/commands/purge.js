const router = require('express').Router();
const busboy = require('connect-busboy');
const fs = require('fs');
const path = require('path');

const isAdmin = require('./privileges');
const models = require('../mongoose/models.js');
const suggestion = models.suggestion;
const conf = models.conference;

router.post('/purge', busboy({ immediate: true }), (req, res) => {
  req.pipe(req.busboy);

  // isAdmin.basic(req, res, () => {
  let id;
  let type;
  let conference;
  const formData = new Map(); // Map inputs to their values

  req.busboy.on('field', (fieldname, val) => {
    formData.set(fieldname, val);
    conference = JSON.parse(formData.get('data'));
    id = conference.id;
    type = conference.type
  });

  const filePurge = new Promise((resolve, reject) => {
    function clean(err, result) {
      if (err) reject();
      else {
        let image = result.image;
        if (image) {
          let file = path.join(__dirname + '../../../static/' + image.split('./')[1].split("'")[0]);
          fs.unlink(file, () => {
            resolve()
          })
        } else resolve()
      }
    }

    if (type === 'suggestion') suggestion.findOne({ _id: id }, (err, result) => { clean(err, result) });
    else if (type === 'conference') conf.findOne({ _id: id }, (err, result) => { clean(err, result) })

  });

  const dbPurge = new Promise((resolve, reject) => {
    function clean (err, result) {
      if (err) reject();
      else {
        result.deleteOne();
        resolve()
      }
    }

    if (type === 'suggestion') suggestion.findOne({ _id: id }, (err, result) => { clean(err, result) });
    else if (type === 'conference') conf.findOne({ _id: id }, (err, result) => { clean(err, result)})

  });

  req.busboy.on('finish', () => {
    function resolve () {
      res.sendStatus(200);
      res.end()
    }
    async function handler () {
      const file = await filePurge();
      const db = await dbPurge();
    }
    handler().then( () => {resolve()})
  })

  //
  // }, () => {
  //   res.sendStatus(403)
  // })
});

module.exports = router;
