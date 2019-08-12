const pug = require('pug');
const router = require('express').Router();
const busboy = require('connect-busboy');
const fs = require('fs')
const path = require('path')
const async = require("async");
const uuid = require("uuid/v1")

var isAdmin = require('./privileges');
var models = require("../mongoose/models.js")
var suggestion = models.suggestion;
var conf = models.conference;


router.get('/purge', (req, res) => {
  var conference = undefined;
  var id = conference.id;
  var type = conference.type;

  req.busboy.on('field', (fieldname, val, ext) => {
    formData.set(fieldname, val);
    conference = JSON.parse(formData.get('data'))
  });

  var dbPurge = () => {
    return New Promise(resolve, reject) => {
      if(type === "suggestion"){
        suggestion.findOne({_id: id}, (err, result) => {
          result.delete()
        })
        
      }else if(type === "conference"){
        conf.findOne({_id: id}, (err, result) => {
          result.delete()
        })

      }
    }
  }

  req.busboy.on("finish", () => {
    function resolve(){
      res.sendStatus(200)
      res.end()
    }
    async function handler() {

      return resolve();
    }
    handler()
  });

});
