var mongoose = require('mongoose')

mongoose.Promise = global.Promise

// mongoose.connect("mongodb://site:kseneU5ffzGUpZ3@ds161397.mlab.com:61397/heroku_6lgfsr4h", { useNewUrlParser: true });

mongoose.connect('mongodb://localhost:27017/designconferences', { useNewUrlParser: true })

var Schema = mongoose.Schema

var userSchema = new Schema({
  username: String,
  name: String,
  password: String,
  email: String,
  isAdmin: {
    type: Number,
    default: 3
  },
  filename: String
}, { collection: 'users' })

var conferenceSchema = new Schema({
  title: String,
  text_date: String,
  start_date: {
    index: Number,
    date: Number,
    month: Number,
    year: Number
  },
  end_date: {
    index: Number,
    date: Number,
    month: Number,
    year: Number
  },
  country: String,
  city: String,
  description: String,
  website: String,
  image: String,
}, { collection: 'conferences' })

var suggestSchema = new Schema({
  title: String,
  text_date: String,
  start_date: {
    index: Number,
    date: Number,
    month: Number,
    year: Number
  },
  end_date: {
      index: Number,
      date: Number,
      month: Number,
      year: Number
  },
  country: String,
  city: String,
  description: String,
  website: String,
  image: String
}, { collection: 'suggestions' })

var person = mongoose.model('Person', userSchema)
var suggestion = mongoose.model('Suggestion', suggestSchema)
var conference = mongoose.model('Conference', conferenceSchema)

module.exports = {
  person,
  suggestion,
  conference
}
