const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const port = 3000
const passport = require('passport')
const sassMiddleware = require('node-sass-middleware')
const path = require('path')
const robots = require('express-robots-txt')

app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.set('views', './pages')
app.set('view engine', 'pug')

app.listen(port, () => console.log(`Running on port ${port}!`))

app.use(require('cookie-parser')())
app.use(
  require('express-session')({
    secret:
      'Some Secret',
    resave: true,
    saveUninitialized: true
  })
)
app.use(
  robots({
    UserAgent: '*',
    Allow: '/',
    CrawlDelay: '5',
    Sitemap: 'https://designconferenc.es/resources/sitemap.xml'
  })
)
app.use(
  sassMiddleware({
    src: path.join(__dirname, '/build'),
    dest: path.join(__dirname, '/static/css'),
    debug: false,
    force: false,
    indentedSyntax: true,
    outputStyle: 'compressed',
    prefix: '/css'
  })
)
app.use(express.static('./static'))

app.use('/', require('./routes/auth'))
app.use('/', require('./routes/pages'))
app.use('/', require('./routes/admin'))
app.use('/', require('./routes/commands/purge'))
app.use('/', require('./routes/commands/accept'))
app.use('/', require('./routes/commands/register'))
app.use('/', require('./routes/commands/search'))
app.use('/', require('./routes/commands/submit'))

app.get('*', function(req, res) {
  res.redirect('/404')
})
