const pug = require('pug');
const router = require('express').Router();
const busboy = require('connect-busboy');
const fs = require('fs')
const path = require('path')
const async = require("async");

var isAdmin = require('./privileges');
var models = require("../mongoose/models.js")
var suggestion = models.suggestion;
var conf = models.conference;


router.post('/purge', busboy({ immediate: true}), (req, res) => {

  req.pipe(req.busboy);

  // isAdmin.basic(req, res, () => {
  var id = undefined;
  var type = undefined;
  let formData = new Map(); // Map inputs to their values

  req.busboy.on('field', (fieldname, val, ext) => {
    formData.set(fieldname, val);
    conference = JSON.parse(formData.get('data'))
    id = conference.id;
    type = conference.type;
  });

  var filePurge = () => {
    return new Promise((resolve, reject) => {
      if(type === "suggestion"){
        suggestion.findOne({_id: id}, (err, result) => {
          if(err) reject()
          else {
            var image = result.image;
            if(image!=undefined){
              var file = path.join(__dirname + "../../../static/" + image.split("./")[1].split("'")[0])
              fs.unlink(file, ()=>{
                resolve()
              })
            }else resolve()

          }
        })

      }else if(type === "conference"){
        conf.findOne({_id: id}, (err, result) => {
          if(err) reject()
          else{
            var image = result.image;
            if(image!=undefined){
              var file = path.join(__dirname + "../../../static/" + image.split("./")[1].split("'")[0])
              fs.unlink(file, ()=>{
                resolve()
              })
            }else resolve()
          }
        })
      }
    })
  }

  var dbPurge = () => {
    return new Promise((resolve, reject) => {
      if(type === "suggestion"){
        suggestion.findOne({_id: id}, (err, result) => {
          if(err) reject()
          else {
            result.deleteOne()
            resolve()
          }
        })

      }else if(type === "conference"){
        conf.findOne({_id: id}, (err, result) => {
          if(err) reject()
          else{
            result.deleteOne()
          }
        })
      }
    })
  }

  req.busboy.on("finish", () => {
    function resolve(){
      res.sendStatus(200)
      res.end()
    }
    async function handler() {
      const file = await filePurge()
      const db = await dbPurge()
      return resolve();
    }
    handler()
  });

  //
  // }, () => {
  //   res.sendStatus(403)
  // })

});

module.exports = router;
