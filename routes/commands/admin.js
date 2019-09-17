const router = require('express').Router();
const busboy = require('connect-busboy');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt')
const saltRounds = 10;
const isAdmin = require('./privileges');
const models = require('../mongoose/models.js');
const person = models.person;

router.post('/update', busboy({ immediate: true }), (req, res) => {

  req.pipe(req.busboy);

  const messages = [
                    'Details were updated!',
                    'Email is already taken',
                    'Username is already taken',
                    'Email and username are taken',
                    'You don\'t have the permissions to do that.',
                    'Something went wrong!',
                    'Couldn\'t save that password for some reason!',
                    'You can\'t delete yourself!',
                    'User was deleted!'
                  ];

  const tmpDir = __dirname + '../../../static/img/tmp/';
  const formData = new Map(); // Map inputs to their values

  const bools = {
    email: 0,
    username: 0
  };

  let updated;
  let original;
  let found = [];
  let problem = 0;

  const fetch_origin = async () => { 
    try{
      await person.findOne({_id: updated.id}, (err, result) => { original = result }) 
    } catch (error) { console.log(error) }
  };

  const fetch_and_filter = async () => {
    try{ 
      await new Promise((resolve, reject) => {
        let uid = ['email', 'username'];
        let info = [updated.email, updated.username];
        for (let i = 0; i < 2; i++) {
          let query = {};
          query[uid[i]] = info[i]; // Output: query = {email: updated.email}
          person.find(query, function (err, result) {
            for(user in result) found.push(result[user])
            for(i in found) {
              if(found[i].id !== updated.id && found.length) { // skip checking the user being modified
                if(found[i].email === updated.email) bools.email +=1
                if(found[i].username === updated.username) bools.username +=1
              }
            }
            resolve();
          })
        }
      })
    } catch (error) { console.log(error) }
  }


  const saveFile = async () => {
    try {
      await new Promise((resolve, reject) => {
        if (updated.filename) { // set to false on client side if we're not updating it

          let tmpName = path.join(tmpDir + updated.filename);
          let newName = path.join(__dirname + '../../../static/' + original.filename.split('\'./')[1].split('\'')[0]) ; // No need to generate a new UUID, we're just going to overwrite

          updated.filename = original.filename;
          fs.rename(tmpName, newName, error => {
            if (error) reject();
            else resolve()
          })

        } else { resolve() }
      })
    } catch (error) { console.log(error) }
  }


  const updatePassword = async () => {
    try {
      await new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(updated.password, salt, function (err, hash) {
            if(err) reject();
            else {
              updated.password = hash;
              resolve()
            }
          })
        })
      })
    } catch (error) { console.log(error) }
  }

  const updateUser = async ( requestor ) => {
    try {
      await new Promise((resolve, reject) => {
        person.findOne({_id: updated.id}, (err, result) => {
          if (err) {
            console.log(err);
            reject();
          }
          else {
            // ehhh - no need for leet code
            if (updated.password) result.password = updated.password;
            if (updated.filename) result.filename = updated.filename;
            if(requestor.isAdmin<=updated.isAdmin && original.isAdmin !== -1) result.isAdmin = updated.isAdmin;
            else {
              problem = 4;
              reject();
            }
            result.username = updated.username;
            result.email = updated.email;
            result.name = updated.name;
            result.save()
              .then(() => {
                resolve();
              })
              .catch(err => {
                console.log(err);
              });
            resolve(); // fallback
          }
        });
      });
    } catch (error) { console.log(error) }
  }

  const deleteUser = async ( requestor ) => {
    if(updated.id == requestor.id) {
      problem = 7;
      resolve();
    }
    else {
      try {
        await person.findByIdAndDelete({_id: updated.id}, (err) => {
          if(err) throw err 
          else problem = 8; return true;
        })
      } catch (error) { console.log(error) }
    }
  }

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
    function resolve () {
      if(bools.email) problem +=1
      if(bools.username) problem += 2;
      res.send(messages[problem])
    }
    async function handler ( requestor ) {
      if (updated.remove) {
        await deleteUser( requestor );
        resolve()
      }else {
        await fetch_origin();
        await fetch_and_filter();
        if(bools.email || bools.username) resolve();
        else {
          if(updated.password) { await updatePassword(); }
          if(updated.filename) { await saveFile();}
          await updateUser( requestor );
          resolve()
        }
      }
    }

    isAdmin.basic(req, res, ( requestor ) => {
      handler( requestor ).catch( () => {
        if(problem>0) res.send(messages[problem])
        else res.send(messages[5])
      })
    }, () => {
      res.send(messages[4])
    })
  })
});

module.exports = router;
