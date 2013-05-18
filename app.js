var application_root = __dirname,
    express = require("express"),
    path = require("path"), fs = require("fs")
var http = require('https');

var privateKey = fs.readFileSync('privatekey.pem').toString();
var certificate = fs.readFileSync('certificate.pem').toString();
var credentials = {key: privateKey, cert: certificate};

var app = module.exports = express();
var https = http.createServer(credentials, app);
var server = https.listen(443);
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
  app.use(express.static(__dirname + '/public', { maxAge: 31557600000 }));
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


//init socket.io
io.sockets.on('connection', function (socket) {

  socket.emit('askPID', null);

  socket.on('PID', function (data) {
    app.gamesManager.checkIfPlayerIsIG(socket, data);
  });

  socket.on('rejoinResponse', function (data) {
    app.gamesManager.rejoinGame(socket, data);    
  });

  socket.on('ready', function (data) {
    app.gamesManager.playerIsReady(socket, data);    
  });

  socket.on('enter', function (data) {
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

