const router = require('express').Router();
const busboy = require('connect-busboy');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const models = require('../mongoose/models.js');
const person = models.person;
const isAdmin = require('./privileges');

router.post('/register', busboy({ immediate: true }), (req, res) => {

  const messages = ['Details were updated!', 'Email is already taken', 'Username is already taken', 'Email and username are taken', 'You don\'t have the permissions to do that.'];

  isAdmin.level(req, res, 1, (requestor) => {

    req.pipe(req.busboy);

    const tmpDir = __dirname + '../../../static/img/tmp/';
    const formData = new Map(); // Map inputs to their values

    let message = messages[0];
    let updated;
    let original;
    let unique = true;

    const existCheck = new Promise((resolve, reject) => {
      let problem = 0;
      let uid = ['email', 'username'];
      let info = [updated.email, updated.username];
      for (let i = 0; i < 2; i++) {
        let query = {};
        query[uid[i]] = info[i]; // Output: query = {email: updated.email}
        person.find(query, function (err, result) {
          if (result.length > 1) {
            // We should only fault an identifier, if there's more than one
            if (result[0].email === updated.email && result[1].email === updated.email) problem += 1;
            if (result[0].username === updated.username && result[1].username === updated.username) problem += 2;
            message = messages[problem];
            unique = false
          }else original = result // caching returned user
        })
      }
      resolve()
    });

    const passUpdate = new Promise((resolve, reject) => {
      if(updated.password){ // set to false on client side if we're not updating it
        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(updated.password, salt, function (err, hash) {
            updated.password = hash;
            resolve()
          })
        })
      }else {
        res.send(messages[4]);
        res.end();
        reject()
      }
    });


    const fileSave = new Promise((resolve, reject) => {
      if (updated.filename) { // set to false on client side if we're not updating it

        let newName = path.join(__dirname + '../../../static/' + original.filename); // No need to generate a new UUID, we're just going to overwrite
        let tmpName = path.join(tmpDir + updated.filename);

        updated.filename = original.filename;

        fs.rename(tmpName, newName, function (err) {
          if (err) {
            console.log('ERROR: ' + err);
            reject();
            res.sendStatus(500);
            res.end()
          } else {
            resolve()
          }
        })

      } else { resolve() }
    });

    const userUpdate = () => {
      return new Promise((resolve, reject) => {
        
      })
    };


    req.busboy.on('field', (fieldname, val) => {
      formData.set(fieldname, val);
      updated = JSON.parse(formData.get('data'))
    });

    req.busboy.on('file', (fieldname, file, fileName) => {
      const fstream = fs.createWriteStream(path.join(tmpDir + fileName));
      file.pipe(fstream);
      fstream.on('close', function () {
        return true // ehhh
      })
    });

    req.busboy.on('finish', () => {
      function resolve () { res.send(message) }
      async function handler () {
        const exists = await existCheck(); // this also stores the returned user in 'original' var
        if(unique){
          const user = await passUpdate();
          const file = await fileSave();
          const save = await userUpdate()
        }
      }
      handler().then( () => { resolve() })
    })

  }, () => {
    res.send(messages[4])
  })
});

module.exports = router;
