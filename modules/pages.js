const pug = require('pug');
const router = require('express').Router();
const async = require("async");

var isAdmin = require('./commands/privileges');
var models = require("./mongoose/models.js")
var person = models.person;
var suggestion = models.suggestion
var conf = models.conference;


// No processing required

router.get('/failed', (req, res) => res.send("Failed"))
router.get('/register', (req, res) => res.render("register"))
router.get('/users', (req, res) => res.render("users"))
router.get('/404', (req, res) => res.render("404"))
router.get('/thanks', (req, res) =>  res.render('thanks'))


// Processing required

router.get('/', (req, res) => {
  person.findOne({_id: req.cookies.UID}, (err, user) => {
    conf.find({}, function(err, conferences){
      if(conferences.length!=0)
        res.render('index', {
          list: conferences,
          user: user
        })
      else{
        res.render('index', {
          user: user
        })
      }
    })
  })
})

router.get('/approve', (req, res) => {
  suggestion.find({}, (err, suggestions)=>{
    if(suggestions){
      res.render('index', {
        manage: true,
        list: suggestions,
        result: suggestions.length
      })
    }else {
      res.render('index', {
        manage: true,
        list: false ,
        result: false
      })
    }
  })

})

router.get('/admin', (req, res) => {
  isAdmin.level(req, res, 1, () =>{
    person.find({}, (err, users) => {
      res.render('admin', {
        users: users
      })
    })
  })
})

router.get('/suggest', (req, res) => {
  isAdmin.level(req, res, 2, () =>{
    res.redirect('/add') // Send an admin to the add page instead
  }, () => {
    res.render('suggest')
  })
})

router.get('/add', (req, res) => {
  isAdmin.basic(req, res, (user) =>{
    res.render('suggest', {
      isAdmin: true,
      firstName: user.firstName
    })
  }, ()=> {
    res.redirect('/suggest')
  })
})

module.exports = router;
