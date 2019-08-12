var mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/website", { useNewUrlParser: true });

var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  first: String,
  last: String,
  age: Number,
  password: String,
  email: String,
  isAdmin: String,
  lvlAdmin: {
    type: Number,
    default: 2
  }
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
