const router = require('express').Router();

const isAdmin = require('./commands/privileges.js');
const models = require('./mongoose/models.js');
const person = models.person;
const conf = models.conference;

const now = new Date();
const time = {
    date: now.getDate(), 
    month: now.getMonth(), 
    year: now.getFullYear()
};

// No processing required
router.get('/cleardb', (req, res) => {
    res.redirect('/')
});


module.exports = router;
