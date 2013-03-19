var application_root = __dirname,
    express = require("express"),
    path = require("path")

var app = module.exports = express();
var server = app.listen(6969);
var io = require('socket.io').listen(server);

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

//database
var db = require('./db')(app);

//load packages
require('./daos')(app);
require('./front')(app);
require('./services')(app);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

app.on('close', db.close); // Close open DB connection when server exits


eval(require('fs').readFileSync('./public/js/game/engine/engine.js', 'utf8'));
var players = [
    new gameData.Player(0, 0), new gameData.Player(1, 0)
  ];
var map = new gameData.Map(gameData.MAP_TYPES.random,
                    gameData.MAP_SIZES.small,
                    gameData.VEGETATION_TYPES.standard,
                    gameData.INITIAL_RESOURCES.standard);
  engineManager.createNewGame(map, players);


io.sockets.on('connection', function (socket) {
  setInterval(function () {
    gameLoop.update();
    var gameData = {};
    gameData.gameElements = gameLogic.gameElements;
    //gameData.grid = gameLogic.grid;
    socket.emit('gameData', gameData);
  }, 1000 / gameLoop.FREQUENCY);
  socket.on('order', function (data) {
    order.dispatchReceivedOrder(data[0], data[1]);
  });
});

