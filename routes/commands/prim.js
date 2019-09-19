const cron = require('node-cron');
const models = require('./mongoose/models');
const conf = models.conference;

let now = new Date();
let time = {
    date: now.getDate(),
    month: now.getMonth(),
    year: now.getFullYear()
};

cron.schedule('59 59 23 * *', () => {
    conf.find({}, (err, result) => {
        for (item in result) {
            if (time.year >= result[item].end_date.year) result[item].remove(); // Out of date year 
            else if (time.year >= result[item].end_date.year && time.month > result[item].end_date.month) result[item].remove(); // handles  month, and ignores real date as irrelevant 
            else if ((time.year >= result[item].end_date.year && time.month >= result[item].end_date.month && time.date > result[item].end_date.date)) result[item].remove(); // handles out of date in same month
            return true
        }
    })
}, {
    scheduled: true
});