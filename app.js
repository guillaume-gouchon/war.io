var application_root = __dirname,
    express = require("express"),
    path = require("path")

var app = module.exports = express();
var server = app.listen(80);
console.log("WarNode Server is running !");

//initializes Socket IO
var io = require('socket.io').listen(server);
//removes debug logs
io.set('log level', 1);


//config 
app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.static(__dirname + '/public'));
});


//console color
var colors = require('colors');
colors.setTheme({
  error: 'red',
  api: 'cyan',
  success: 'green',
  info: 'yellow',
  debug: 'grey'
});


require('./services')(app);


//setup index page
app.get('/', function (req, res) {
  if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=' + (31557600));
  res.sendfile(__dirname + '/public/index.html');
});


//initialize socket.io
io.sockets.on('connection', function (socket) {

  socket.emit('askUserData', null);

  socket.on('userData', function (data) {
    if (data == null) {
      app.gamesManager.addPlayerToGamesUpdates(socket);
    } else {
      app.gamesManager.addPlayer(socket, data);
    }
  });

  socket.on('goOffline', function() {
    app.gamesManager.playerDisconnected(socket);
  });

  socket.on('disconnect', function() {
    app.gamesManager.playerDisconnected(socket);
  });

});

