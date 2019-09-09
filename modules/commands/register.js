const router = require('express').Router();
const busboy = require('connect-busboy');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const models = require('../mongoose/models.js');
const person = models.person;
const isAdmin = require('./privileges');

router.post('/register', busboy({ immediate: true }), (req, res) => {
  isAdmin.basic(req, res, () => {
    req.pipe(req.busboy);

    const messages = ['User is registered!', 'Email is already taken', 'Username is already taken', 'Email and username are taken', 'You don\'t have the permissions to do that.'];
    const tmpDir = __dirname + '../../../static/img/tmp/';
    const formData = new Map(); // Map inputs to their values

    let user;
    let query;
    let message = messages[0];
    let unique = true;

    const existCheck = new Promise((resolve, reject) => {
      let problem = 0;
      let uid = ['email', 'username'];
      let info = [user.email, user.username];
      for (i = 0; i < 2; i++) {
        query = {};
        query[uid[i]] = info[i] // Output: query = {email: user.email}
        person.find(query, function (err, result) {
          if (result.length !== 0) {
            unique = false;
            if (result[0].email === user.email) problem += 1;
            if (result[0].username === user.username) problem += 2;
            message = messages[problem]
          }
        })
      }
      resolve()
    });

    const userSave = new Promise((resolve, reject) => {
      let pass = user.password;
      bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(pass, salt, function (err, hash) {
          user.password = hash;
          let uData = new person(user);
          uData.save()
              .then(() => {
                resolve()
              })
              .catch(err => {
                console.log(err)
              });
          resolve()
        })
      })
    });


    const fileSave = new Promise((resolve, reject) => {
      if (user.filename) { // don't run if there's no file

        function ext () {
          let t = user.filename.split('.');
          return (t[t.length - 1]).toString()
        }

        let tmpName = path.join(tmpDir + user.filename);
        let newName = path.join(__dirname + '../../../static/img/profiles/' + uuid() + user.name.replace(/ /g, '') + '.' + ext());
        user.filename = "'./" + newName.split('/static/')[1] + "'";

        fs.rename(tmpName, newName, function (err) {
          if (err) {
            console.log('ERROR: ' + err);
            reject()
            res.sendStatus(500);
            res.end()
          } else {
            resolve()
          }
        })

      } else resolve()
    });

    req.busboy.on('field', (fieldname, val) => {
      formData.set(fieldname, val);
      user = JSON.parse(formData.get('data'))
    });

    req.busboy.on('file', (fieldname, file, fileName) => {
      const fstream = fs.createWriteStream(path.join(tmpDir + fileName));
      file.pipe(fstream);
      fstream.on('close', function () {
        return true // ehhh
      })
    });

    req.busboy.on('finish', () => {
      function resolve () {
        res.send(message)
      }
      async function handler () {
        const exists = await existCheck();
        if(unique){
          const file = await fileSave();
          const user = await userSave()
        }
      }
      handler().then(() => { resolve()})
    })
  }, () => {
    res.redirect('/')
  })
});

module.exports = router;
