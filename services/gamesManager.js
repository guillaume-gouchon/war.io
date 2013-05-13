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
	* List of players in waiting list.
	*/
	app.gamesManager.playersWaiting = {};


	/**
	*	Main Loop.
	*/
	app.gamesManager.loop = null;


	/**
	*	A player has created / joined a game.
	*/
	app.gamesManager.addPlayer = function (socket, data) {
		if (data.game.gameId != null) {
			//join game
			for (var i in app.gamesManager.games) {
				if (app.gamesManager.games[i].id == data.game.gameId) {
					delete app.gamesManager.playersWaiting.id;
					app.gamesManager.addPlayerToGame(socket, app.gamesManager.games[i], data.player);
					break;
				}
			}
		} else {
			//create new game
			app.gamesManager.createNewGame(data.game);
			app.gamesManager.addPlayerToGame(socket, app.gamesManager.games[app.gamesManager.games.length - 1], data.player);
		}	  
	}


	/**
	*	Creates a new game.
	*/
	app.gamesManager.createNewGame = function (gameInitialData) {
		console.log(new Date() + ' | Creating new game'.info);
		var game = new gameData.Game();
		game.id = gameData.createUniqueId();
		game.sockets = [];
		game.nbPlayers = gameInitialData.nbPlayers;
 		game.map = new gameData.Map(gameData.MAP_TYPES[gameInitialData.mapType],
	                    gameData.MAP_SIZES[gameInitialData.mapSize],
	                    gameData.VEGETATION_TYPES[gameInitialData.vegetation],
	                    gameData.INITIAL_RESOURCES[gameInitialData.initialResources]);
		app.gamesManager.games.push(game);

		app.gamesManager.sendGameListUpdate();
	}


	/**
	*	Adds a player to an existing game.
	*/
	app.gamesManager.addPlayerToGame = function (socket, game, playerInitialData) {
		console.log(new Date() + ' | Add player to game '.info + game.id);
		var player = new gameData.Player(playerInitialData.playerId, game.players.length, playerInitialData.army);
		player.n = playerInitialData.name;
		game.players.push(player);
		game.sockets.push(socket);

		if (game.players.length == game.nbPlayers) {
			//starts the game if it is full
			app.gamesManager.startGame(game);
		} else {
			//send to player that a new player has joined
			for (var i in game.sockets) {
				game.sockets[i].emit('updateGamePlayers', 
					{
						players: game.players,
						playersMax: game.nbPlayers
					}
				);	
			}
		}

		app.gamesManager.sendGameListUpdate();
	}


	/**
	*	Checks if the player was already in a game.
	*/
	/*app.gamesManager.isPlayerInGame = function (socket, playerInitialData) {
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
	}*/


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
		console.log(new Date() + ' | Starts a game !'.success);

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

		app.gamesManager.sendGameListUpdate();
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
					if (data.players[i].s == gameData.PLAYER_STATUSES.defeat
						|| data.players[i].s == gameData.PLAYER_STATUSES.victory) {
						game.sockets[i].emit('gameStats', game.stats);
						game.sockets[i] = null;
					}
				}
			}

			return app.gamesManager.isUselessGame(game);

		} catch(e) {
			console.log(new Date() + e);
		}

		return false;
	}


	/**
	*	Stops a game.
	*/
	app.gamesManager.stopGame = function (index) {
		app.gamesManager.games.splice(index, 1);
    	console.log(new Date() + ' | One game has been stopped'.debug);
		//stop the loop if there are no more games
		if (app.gamesManager.games.length == 0) {
			app.gamesManager.stopLoop();
		}
	}


	/**
	*	One player has just been disconnected.
	*/
	app.gamesManager.playerDisconnected = function (socket) {
		console.log(new Date() + ' | One player has been disconnected'.debug);
		for (var i in app.gamesManager.games) {
      		var n = app.gamesManager.games[i].sockets.indexOf(socket);
	      	if (n >= 0) {
		        app.gamesManager.games[i].sockets[n] = null;
		        if (app.gamesManager.isUselessGame(app.gamesManager.games[i])) {
		        	console.log(new Date() + ' | Game '.info + app.gamesManager.games[i].id + ' has been removed'.info);
		        	app.gamesManager.stopGame(i);
		        	app.gamesManager.sendGameListUpdate();
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
	*
	*/
	app.gamesManager.addPlayerToGamesUpdates = function (socket) {
		app.gamesManager.playersWaiting[socket.id] = socket;
		app.gamesManager.sendGameListUpdate(socket);
	}


	/**
	*
	*/
	app.gamesManager.sendGameListUpdate = function (socket) {
		var availableGames = []; 
		for (var i in app.gamesManager.games) {
			if (!app.gamesManager.games[i].hasStarted && app.gamesManager.games[i].players.length > 0) {
				var game = app.gamesManager.games[i];
				availableGames.push(
					{
						id: game.id,
						name: game.players[0].n,
						currentPlayers: game.players.length,
						maxPlayers: game.nbPlayers
					}
				);
			}
		}

		if (socket == null) {
			for (var i in app.gamesManager.playersWaiting) {
				app.gamesManager.playersWaiting[i].emit('joinListUpdate', availableGames);
			}
		} else {
			socket.emit('joinListUpdate', availableGames);
		}
	}
}
