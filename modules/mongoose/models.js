var mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb:/site:AwGG4n5x@Fj2i@j@ds161397.mlab.com:61397/heroku_6lgfsr4h", { useNewUrlParser: true });




var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  first: String,
  password: String,
  email: String,
  isAdmin: {
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
