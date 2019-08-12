const bodyParser = require('body-parser')
const express = require('express');
const app = express();
var port = process.env.PORT || 8080;
const passport = require('passport');


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
app.use('/', require('./modules/pages'));
app.use('/', require('./modules/functions'));
app.use('/', require('./modules/commands/search'));
app.use('/', require('./modules/commands/submit'));
app.use('/', require('./modules/commands/purge'));

app.get('*', function(req, res) {
  res.redirect('/404');
});


// var app = require('../designconferenc.es');
// var http = require('http');
// var cluster = require('cluster');
//
// var port = process.env.PORT || '80';
// app.set('port', port);
//
//
// // Code to run if we're in the master process
// if (cluster.isMaster) {
//
//   var cpuCount = require('os').cpus().length;
//
//   // Create a worker for each CPU
//   for (var i = 0; i < cpuCount; i += 1) {
//       cluster.fork();
//   }
//
// } else {
//   var server = http.createServer(app);
//   server.listen(port);
//   server.on('listening', onListening);
// }
//
// cluster.on('exit', function(worker) {
//   console.log('Worker ' + worker.id + ' died :(');
//   cluster.fork();
// });
//
// function onListening() {
//   var addr = server.address();
//   var bind = typeof addr === 'string'
//     ? 'pipe ' + addr
//     : 'port ' + addr.port;
//     console.log('Listening on ' + bind);
// }
