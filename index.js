const bodyParser = require('body-parser')
const express = require('express');
const app = express();
const port = 3000;
const passport = require('passport');
var httpsRedirect = require('express-https-redirect');

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', './pages')
app.set('view engine', 'pug')


app.listen(port, () => console.log(`Running on port ${port}!`))

app.use(require('cookie-parser')());
app.use(require('express-session')({
  secret: 'f',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static("./static"));

app.use('/', require('./modules/auth'));
app.use('/', require('./modules/functions'));
app.use('/', require('./modules/pages'));

app.use('/', require('./modules/commands/purge'));
app.use('/', require('./modules/commands/register'));
app.use('/', require('./modules/commands/search'));
app.use('/', require('./modules/commands/submit'));
app.use('/', httpsRedirect());

app.get('*', function(req, res) {
  res.redirect('/404');
});
