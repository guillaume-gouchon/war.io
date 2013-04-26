module.exports = function(app){

	app.gamesManager = {};

	//get game's data and game's engine 
	eval(require('fs').readFileSync('./public/js/game/engine.js', 'utf8'));
	eval(require('fs').readFileSync('./public/js/game/data.js', 'utf8'));


	/**
	*	List of current games.
	*/
	app.gamesManager.games = [];


	/**
	*	Main Loop.
	*/
	app.gamesManager.loop = null;


	/**
	*	Dispatches a player in a game.
	*/
	app.gamesManager.dispatchPlayer = function (socket, playerData) {
		if (!app.gamesManager.isPlayerInGame(socket, playerData.player)) {
			var lastGame = app.gamesManager.games[app.gamesManager.games.length - 1];
			if (app.gamesManager.games.length == 0 || lastGame.players.length == lastGame.nbPlayers) {
				//no room available, create a new game
				app.gamesManager.createNewGame(playerData.game);
				socket.emit('gameCreator', app.gamesManager.games[app.gamesManager.games.length - 1].id);
			}

			//add player to the last game
			app.gamesManager.addPlayerToGame(socket, app.gamesManager.games[app.gamesManager.games.length - 1], playerData.player);
		}		  
	}


	/**
	*	Checks if the player was already in a game.
	*/
	app.gamesManager.isPlayerInGame = function (socket, playerInitialData) {
		for (var i in app.gamesManager.games) {
			var game = app.gamesManager.games[i];
		    for (var j in game.players) {
		      	if(game.players[j].pid == playerInitialData.playerId) {
		      		//the player was in a game, update his socket
			        game.sockets[j] = socket;
			        if(game.iterate >= 0) {
			        	//game has started, send the player the game info
						app.gamesManager.sendGameInfo(socket, game, j);

						//reinit the order socket
						game.sockets[j].on('order', function (data) {
							game.orders.push([data[0], data[1]]);
						});
		        	}
		        	return true;
		    	}
	    	}
	    }
	    return false;
	}


	/**
	*	Creates a new game.
	*/
	app.gamesManager.createNewGame = function (gameInitialData) {
		console.log('Creating new game'.info);
		var game = new gameData.Game();
		game.id = gameData.createUniqueId();
		game.sockets = [];
		game.nbPlayers = 2;
 		game.map = new gameData.Map(gameData.MAP_TYPES[gameInitialData.mapType],
	                    gameData.MAP_SIZES[gameInitialData.mapSize],
	                    gameData.VEGETATION_TYPES[gameInitialData.vegetation],
	                    gameData.INITIAL_RESOURCES[gameInitialData.initialResources]);
		app.gamesManager.games.push(game);
	}


	/**
	*	Adds a player to an existing game.
	*/
	app.gamesManager.addPlayerToGame = function (socket, game, playerInitialData) {
		console.log('Add player to game '.info + game.id);
		var player = new gameData.Player(playerInitialData.playerId, game.players.length, playerInitialData.army);
		game.players.push(player);
		game.sockets.push(socket);

		if (game.players.length == game.nbPlayers) {
			//starts the game if it is full
			app.gamesManager.startGame(game);
		}
	}


	/**
	*	Sends a player the game info he needs to initializes the game.
	*/
	app.gamesManager.sendGameInfo = function (socket, game, playerIndex) {
		var gameInfo = {
			map: game.map,
			players: game.players,
			myArmy: playerIndex,
			initElements: game.gameElements 
		};
		socket.emit('gameStart', gameInfo);
	}


	/**
	*	Starts a game.
	*/
	app.gamesManager.startGame = function (game) {
		console.log('Starts a game !'.success);

		//update game
		var someMoreGameData = gameCreation.createNewGame(game.map, game.players);
		game.players = someMoreGameData.players;
		game.stats = someMoreGameData.stats;
		game.grid = someMoreGameData.grid;
		game.gameElements = someMoreGameData.gameElements;
		game.added = someMoreGameData.added;
		game.orders = [];
		game.hasStarted = true;

		//send game info to the players
		for (var i in game.players) {
			if(game.sockets[i] != null) {
				app.gamesManager.sendGameInfo(game.sockets[i], game, i);

				//init the order socket
				game.sockets[i].on('order', function (data) {
					game.orders.push([data[0], data[1]]);
				});
			}
		}

		//start loop if it is stopped
		if (app.gamesManager.loop == null) {
			app.gamesManager.startLoop();
		}
	}


	/**
	*	Starts update loop.
	*/
	app.gamesManager.startLoop = function () {
		app.gamesManager.loop = setInterval(function () {
			var i = app.gamesManager.games.length;
			while (i --) {
				if (app.gamesManager.games[i].hasStarted && app.gamesManager.processGame(app.gamesManager.games[i])) {
					//game is over
					app.gamesManager.stopGame(i);
				}
			}
		}, 1000 / gameLogic.FREQUENCY);
	}


	/**
	*	Stops the update loop.
	*/
	app.gamesManager.stopLoop = function () {
		clearInterval(app.gamesManager.loop);
		app.gamesManager.loop = null;
	}


	/**
	*	Processes one game loop.
	*/
	app.gamesManager.processGame = function (game) {
		try {
			//send game data to each player
			var data = game.update();
			for (var i in game.players) {
				if(game.sockets[i] != null) {
					game.sockets[i].emit('gameData', data);
				}
			}

			//check end of game
			for (var i in data.players) {
				if (game.sockets[i] != null) {
					if (data.players[i].s == gameData.PLAYER_STATUSES.victory) {
						game.sockets[i].emit('gameStats', game.stats);
						game.sockets[i] = null;
					} else if (data.players[i].s == gameData.PLAYER_STATUSES.defeat) {
						game.sockets[i].emit('gameStats', game.stats);
						game.sockets[i] = null;
					}
				}
			}
		} catch(e) {
			console.log(e);
		}

		return false;
	}


	/**
	*	Stops a game.
	*/
	app.gamesManager.stopGame = function (index) {
		app.gamesManager.games.splice(index, 1);

		//stop the loop if there are no more games
		if (app.gamesManager.games.length == 0) {
			app.gamesManager.stopLoop();
		}
	}


	/**
	*	One player has just been disconnected.
	*/
	app.gamesManager.playerDisconnected = function (socket) {
		console.log('One player has been disconnected'.debug);
		for (var i in app.gamesManager.games) {
      		var n = app.gamesManager.games[i].sockets.indexOf(socket);
	      	if (n >= 0) {
		        app.gamesManager.games[i].sockets[n] = null;
		        if (app.gamesManager.isUselessGame(app.gamesManager.games[i])) {
		        	console.log('Game '.info + app.gamesManager.games[i].id + ' has been removed'.info);
		        	//TODO : save it
		        	app.gamesManager.stopGame(i);
		        }
		        break;
	      	}
	    }
	}


	/**
	*	Checks if all the players have left the game.
	*/
	app.gamesManager.isUselessGame = function (game) {
		for (var i in game.sockets) {
			if (game.sockets[i] != null) {
				return false;
			}
		}
		return true;
	}


	/**
	*	Changes the game data before it starts.
	*/
	app.gamesManager.changeGameData = function (gameData) {
		for (var i in app.gamesManager.games) {
      		var game = app.gamesManager.games[i];
      		if (game.id == gameData.gameId) {
      			//change number of players
      			if (game.players.length <= gameData.nbPlayers) {
	      			game.nbPlayers = gameData.nbPlayers;
	      			if (game.players.length == gameData.nbPlayers) {
						app.gamesManager.startGame(game);
	      			}
      			}
      			break;	
      		}
      	}
	}

}
