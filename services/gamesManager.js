module.exports = function(app){

	app.gamesManager = {};

	// get game's engine and data 
	eval(require('fs').readFileSync('./public/js/game/engine.js', 'utf8'));
	eval(require('fs').readFileSync('./public/js/game/data.js', 'utf8'));


	/**
	*	Main games loop.
	*/
	app.gamesManager.loop = null;


	/**
	*	List of games.
	*/
	app.gamesManager.joinableGames = {};
	app.gamesManager.runningGames = {};


	/**
	* 	List of players in the salon.
	*/
	app.gamesManager.playersWaiting = {};


	// init socket.io
	app.io.sockets.on('connection', function (socket) {

		socket.emit('data', {type: gameData.TO_CLIENT_SOCKET.login});

		socket.on(gameData.TO_SERVER_SOCKET.login, function (data) {
			app.gamesManager.checkIfPlayerWasIG(socket, data);
		});

		socket.on(gameData.TO_SERVER_SOCKET.createNewGame, function (data) {
			app.gamesManager.createNewGame(socket, data);
		});

		socket.on(gameData.TO_SERVER_SOCKET.enterSalon, function (data) {
			app.gamesManager.enterSalon(socket);
		});

		socket.on(gameData.TO_SERVER_SOCKET.leaveSalon, function (data) {
			app.gamesManager.leaveSalon(socket);
		});

		socket.on(gameData.TO_SERVER_SOCKET.joinGame, function (data) {
			app.gamesManager.joinGame(socket, data);
		});

		socket.on(gameData.TO_SERVER_SOCKET.updateLoadingProgress, function (data) {
			app.gamesManager.updateLoadingProgress(socket, data);
		});

		socket.on(gameData.TO_SERVER_SOCKET.sendOrder, function (data) {
			app.gamesManager.sendOrder(socket, data);
		});

	});


	/**
	*	Creates a new game.
	*/
	app.gamesManager.createNewGame = function (socket, data) {
		
		console.log(new Date() + ' | Creating new game'.info);
		
		var game = new gameData.Game();
		game.id = gameData.createUniqueId();
		game.sockets = [socket];

		// add creator
		var player = new gameData.Player(data.playerId, 0, data.armyId, false);
		player.n = data.playerName;
		game.players = [player];

		// add AI players
		for (var i = 0; i < data.nbIAPlayers; i++) {
			var player = new gameData.Player(Math.random(), (i + 1), 0, true);
			player.n = gameData.getRandomName();
			game.sockets.push(null);
		}

		game.nbPlayers = data.nbPlayers;
		game.map = new gameData.Map(gameData.MAP_TYPES[Object.keys(gameData.MAP_TYPES)[data.mapType]],
			gameData.MAP_SIZES[Object.keys(gameData.MAP_SIZES)[data.mapSize]],
			gameData.VEGETATION_TYPES[Object.keys(gameData.VEGETATION_TYPES)[data.vegetation]],
			gameData.INITIAL_RESOURCES[Object.keys(gameData.INITIAL_RESOURCES)[data.initialResources]]);

		app.gamesManager.joinableGames[game.id] = game;
		app.gamesManager.notifyGamesListChanged();

	}


	/**
	*	A new player has entered the salon.
	*/
	app.gamesManager.enterSalon = function (socket) {

		app.gamesManager.playersWaiting[socket.id] = socket;
		app.gamesManager.notifyGamesListChanged(socket);

		console.log(new Date() + ' | ' + Object.keys(app.gamesManager.playersWaiting).length + ' players in salon'.info);

	}


	/**
	*	A new player has left the salon.
	*/
	app.gamesManager.leaveSalon = function (socket) {

		delete app.gamesManager.playersWaiting[socket.id];

		console.log(new Date() + ' | ' + Object.keys(app.gamesManager.playersWaiting).length + ' players in salon'.info);

	}


	/**
	*	A player has joined a game.
	*/
	app.gamesManager.joinGame = function (socket, data) {

		console.log(new Date() + ' | A player joined game '.info + data.gameId);

		var game = app.gamesManager.joinableGames[data.gameId];
		if (game == null) { return; }

		app.gamesManager.leaveSalon(socket);

    	// create player
    	var player = new gameData.Player(data.playerId, game.players.length, data.armyId);
    	player.n = data.playerName;

    	game.players.push(player);
    	game.sockets.push(socket);

    	if (game.players.length == game.nbPlayers) {

			// starts the game !
			app.gamesManager.startGame(game);

		} else {

			// TODO : notify loading

		}

		app.gamesManager.notifyGamesListChanged();

	}


    /**
    *	A player is loading the game.
    */
    app.gamesManager.updateLoadingProgress = function (socket, data) {

    	

    	
    }


    /**
    *	A player sent an order.
    */

    app.gamesManager.sendOrder = function (socket, data) {

    	var game = app.gamesManager.runningGames[data.gameId];

    	if (game != null) {

    		game.orders.push([data.type, data.params]);

    	}  
    	
    }


	/**
	*	Sends the players the updated joinable games list.
	*/
	app.gamesManager.notifyGamesListChanged = function (socket) {

		var availableGames = [];
		for (var i in app.gamesManager.joinableGames) {
			var game = app.gamesManager.joinableGames[i];
			availableGames.push(
			{
				id: game.id,
				creatorName: game.players[0].n,
				mapSize: game.map.size.name,
				initialResources: game.map.ir.name,
				objectives: [],
				players: game.players.length + ' / ' + game.nbPlayers
			}
			);
		}

		var data = {
			type: gameData.TO_CLIENT_SOCKET.listJoinableGames,
			games: availableGames
		};

		if (socket != null) {

			// direct update to a new player who has entered the salon
			socket.emit('data', data);

		} else {

			// send notifications to all the players in the salon
			for (var i in app.gamesManager.playersWaiting) {
				app.gamesManager.playersWaiting[i].emit('data', data);
			}

		}

	}


	/**
	*	Starts a game.
	*/
	app.gamesManager.startGame = function (game) {

		console.log(new Date() + ' | A game just started !'.success);

		
		// update game with some more info
		var someMoreGameData = gameCreation.createNewGame(game.map, game.players);
		game.players = someMoreGameData.players;
		game.stats = someMoreGameData.stats;
		game.grid = someMoreGameData.grid;
		game.gameElements = someMoreGameData.gameElements;
		game.added = someMoreGameData.added;
		game.orders = [];

		// move game from joinable to running
		delete app.gamesManager.joinableGames[game.id];
		app.gamesManager.runningGames[game.id] = game;

		// send game info to the players
		for (var i in game.players) {
			if(game.sockets[i] != null) {
				app.gamesManager.sendGameInfo(game.sockets[i], game, i);
			}
		}

		// start the main games loop if it is stopped
		if (app.gamesManager.loop == null) {
			app.gamesManager.startLoop();
		}

		app.gamesManager.notifyGamesListChanged();

	}


	/**
	*	Sends a player the game info he needs to initializes the game.
	*/
	app.gamesManager.sendGameInfo = function (socket, game, playerIndex) {

		var data = {
			type: gameData.TO_CLIENT_SOCKET.gameStart,
			gameId: game.id,
			players: game.players,
			myArmy: playerIndex,
			map: game.map,
			initElements: game.gameElements 
		};

		socket.emit('data', data);

	}


	/**
	*	Starts main games loop.
	*/
	app.gamesManager.startLoop = function () {

		console.log(new Date() + ' | Loop has started !'.success);

		app.gamesManager.loop = setInterval(function () {

			for (var i in app.gamesManager.runningGames) {
				
				var game = app.gamesManager.runningGames[i];
				var gameover = app.gamesManager.processGame(game);

				if (gameover) {

					// game is over
					app.gamesManager.stopGame(i);

				}

			}

		}, 1000 / gameLogic.FREQUENCY);

	}


	/**
	*	Stops the update loop.
	*/
	app.gamesManager.stopLoop = function () {

		console.log(new Date() + ' | Loop has just stopped !'.debug);

		clearInterval(app.gamesManager.loop);
		app.gamesManager.loop = null;

	}


	/**
	*	Processes one game loop.
	*/
	app.gamesManager.processGame = function (game) {
		try {

			// send game data to each player
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
						|| data.players[i].s == gameData.PLAYER_STATUSES.victory
						|| data.players[i].s == gameData.PLAYER_STATUSES.surrender) {

						var dataStats = {
							type: gameData.TO_CLIENT_SOCKET.gameStats,
							stats: data.stats
						};
						game.sockets[i].emit('data', dataStats);
						game.sockets[i] = null;

					}

				}

			}

			return app.gamesManager.isUselessGame(game);

		} catch(e) {

			console.log(new Date() + ' : ' + e);

		}

		return false;
	}


	/**
	*	Stops a game.
	*/
	app.gamesManager.stopGame = function (gameId) {
		
		console.log(new Date() + ' | One game has been stopped'.debug);

		delete app.gamesManager.runningGames.gameId;

		// stop the loop if there are no more games
		if (Object.keys(app.gamesManager.runningGames).length == 0) {
			
			app.gamesManager.stopLoop();

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
	*	Checks if player was already in game. If so, ask him to rejoin.
	*/
	app.gamesManager.checkIfPlayerWasIG = function (socket, playerId) {

		for (var i in app.gamesManager.runningGames) {

			var game = app.gamesManager.runningGames[i];

			for (var j in game.players) {

				if(game.players[j].pid == playerId
					&& game.players[j].s == gameData.PLAYER_STATUSES.ig) {

		      		//ask player to rejoin game
		      	var data = {
		      		type: gameData.TO_CLIENT_SOCKET.rejoin,
		      		id: game.id,
		      		name: game.players[0].n,
		      		nbPlayers: game.nbPlayers
		      	}
		      	socket.emit('data', data);

		      	return;
		      }

		  }

		}
	}


	/**
	*	The player rejoins a game.
	*/
	app.gamesManager.rejoinGame = function (socket, playerId) {
		for (var i in app.gamesManager.games) {
			var game = app.gamesManager.games[i];
			for (var j in game.players) {
				if(game.players[j].pid == playerId) {

					game.sockets[j] = socket;

					//the player was in a game
					if(game.iterate >= 0) {
			        	//game has started, send the player the game info
			        	app.gamesManager.sendGameInfo(socket, game, j);

						//update his socket

						//reinit the order socket
						game.sockets[j].on('order', function (data) {
							game.orders.push([data[0], data[1]]);
						});
					}

					return;
				}
			}
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

}
