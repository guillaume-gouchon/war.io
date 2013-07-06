var application_root = __dirname,
    express = require("express"),
    config = require('./config');

var app = module.exports = express();
var server = app.listen(config.server.port);
console.log("WarNode Server is running !");

// initializes Socket IO
app.io = require('socket.io').listen(server);
// removes debug logs
app.io.set('log level', 1);


// config
app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.static(__dirname + '/public', { maxAge: config.server.ageCache * 1000 }));
});


// console color
var colors = require('colors');
colors.setTheme({
  error: 'red',
  api: 'cyan',
  success: 'green',
  info: 'yellow',
  debug: 'grey'
});


require('./services/gameServices')(app);


// setup index page route
app.get('/', function (req, res) {
  if (config.server.enableCaching && !res.getHeader('Cache-Control')) {
    res.setHeader('Cache-Control', 'public, max-age=' + config.server.ageCache);
  }
  res.sendfile(__dirname + '/public/index.html');
});
