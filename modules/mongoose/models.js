var mongoose = require("mongoose");

mongoose.Promise = global.Promise;

// mongoose.connect("mongodb://site:kseneU5ffzGUpZ3@ds161397.mlab.com:61397/heroku_6lgfsr4h", { useNewUrlParser: true });

mongoose.connect('mongodb://localhost:27017/website', {useNewUrlParser: true});

var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  name: String,
  password: String,
  email: String,
  isAdmin: {
    type: Number,
    default: 2
  },
  file: String
}, {collection: 'users'});

var conferenceSchema = new Schema({
  title: String,
  date: String,
  country: String,
  city: String,
  description: String,
  website: String,
  image: String
}, { collection: 'conferences' });

var suggestSchema = new Schema({
  title: String,
  date: String,
  country: String,
  city: String,
  description: String,
  website: String,
  image: String
}, { collection: 'suggestions' });

var person = mongoose.model("Person", userSchema);
var suggestion = mongoose.model("Suggestion", suggestSchema);
var conference = mongoose.model("Conference", conferenceSchema);

module.exports = {
  person,
  suggestion,
  conference
}
