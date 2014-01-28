var express = require("express");

// server config
var app = module.exports = express();
app.configure(function () {
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.static(__dirname + '/public/dist', { maxAge: 100000 * 1000 }));
});

// console colors
var colors = require('colors');
colors.setTheme({
  error: 'red',
  api: 'cyan',
  success: 'green',
  info: 'yellow',
  debug: 'grey'
});

// setup routes
app.get('/', function (req, res) {
  if (!res.getHeader('Cache-Control')) {
    res.setHeader('Cache-Control', 'public, max-age=' + 100000);
  }
  res.sendfile(__dirname + '/public/dist/index.html');
});

// start server
var port = 3000;
var server = app.listen(port);

// initializes Socket IO
app.io = require('socket.io').listen(server);
// removes debug logs
app.io.set('log level', 1);

// import game services
require('./services/gameServices')(app);

console.log("WarNode Server is running on port ".green + port + " !".green);
