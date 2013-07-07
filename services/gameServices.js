module.exports = function(app){

	app.gameServices = {};

	// get game's engine and data 
	eval(require('fs').readFileSync('./public/js/game/engine.js', 'utf8'));
	eval(require('fs').readFileSync('./public/js/game/data.js', 'utf8'));


	/**
	*	Main games loop.
	*/
	app.gameServices.loop = null;


	/**
	*	List of games.
	*/
	app.gameServices.joinableGames = {};
	app.gameServices.runningGames = {};

	app.gameServices.playersIg = {};

	/**
	* 	List of players in the salon.
	*/
	app.gameServices.playersWaiting = {};


	// init socket.io
	app.io.sockets.on('connection', function (socket) {

		socket.emit('data', {type: gameData.TO_CLIENT_SOCKET.login});

		socket.on(gameData.TO_SERVER_SOCKET.login, function (data) {
			app.gameServices.checkIfPlayerWasIG(socket, data);
		});

		socket.on(gameData.TO_SERVER_SOCKET.createNewGame, function (data) {
			app.gameServices.createNewGame(socket, data);
		});

		socket.on(gameData.TO_SERVER_SOCKET.enterSalon, function (data) {
			app.gameServices.enterSalon(socket);
		});

		socket.on(gameData.TO_SERVER_SOCKET.leaveSalon, function (data) {
			app.gameServices.leaveSalon(socket);
		});

		socket.on(gameData.TO_SERVER_SOCKET.joinGame, function (data) {
			app.gameServices.joinGame(socket, data);
		});

		socket.on(gameData.TO_SERVER_SOCKET.updateLoadingProgress, function (data) {
			app.gameServices.updateLoadingProgress(socket, data);
		});

		socket.on(gameData.TO_SERVER_SOCKET.sendOrder, function (data) {
			app.gameServices.sendOrder(socket, data);
		});

		socket.on(gameData.TO_SERVER_SOCKET.rejoinGame, function (data) {
			app.gameServices.rejoinGame(socket, data);
		});

		socket.on('disconnect', function() {
			app.gameServices.disconnect(socket);
	   });

	});


	/**
	*	Creates a new game.
	*/
	app.gameServices.createNewGame = function (socket, data) {
		
		console.log(new Date() + ' | Creating new game'.info);
		
		var game = new gameData.Game();
		game.id = new Date().getTime() + Math.random();
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
			gameData.INITIAL_RESOURCES[Object.keys(gameData.INITIAL_RESOURCES)[data.initialResources]],
			data.objectives);

		app.gameServices.joinableGames[game.id] = game;
		app.gameServices.playersIg[data.playerId] = game.id;
		app.gameServices.notifyGamesListChanged();

	}


	/**
	*	A new player has entered the salon.
	*/
	app.gameServices.enterSalon = function (socket) {

		app.gameServices.playersWaiting[socket.id] = socket;
		app.gameServices.notifyGamesListChanged(socket);

		console.log(new Date() + ' | ' + Object.keys(app.gameServices.playersWaiting).length + ' players in salon'.info);

	}


	/**
	*	A new player has left the salon.
	*/
	app.gameServices.leaveSalon = function (socket) {

		delete app.gameServices.playersWaiting[socket.id];

		console.log(new Date() + ' | ' + Object.keys(app.gameServices.playersWaiting).length + ' players in salon'.info);

	}


	/**
	*	A player has joined a game.
	*/
	app.gameServices.joinGame = function (socket, data) {

		console.log(new Date() + ' | A player joined game '.info + data.gameId);

		var game = app.gameServices.joinableGames[data.gameId];
		if (game == null) { return; }

		app.gameServices.leaveSalon(socket);

    	// create player
    	var player = new gameData.Player(data.playerId, game.players.length, data.armyId);
    	player.n = data.playerName;

    	game.players.push(player);
    	game.sockets.push(socket);
    	app.gameServices.playersIg[data.playerId] = game.id;

    	app.gameServices.notifyQueueChange(game);

    	if (game.players.length == game.nbPlayers) {

			// starts the game !
			app.gameServices.startGame(game);

		}

		app.gameServices.notifyGamesListChanged();

	}


	/**
    *	A player is loading the game.
    */
    app.gameServices.notifyQueueChange = function (game) {

    	// notify queue change
		var dataPlayers = {
			type : gameData.TO_CLIENT_SOCKET.updateQueue,
			players: game.players
		};

		for (var i in game.players) {
    		var player = game.players[i];
    		if (game.sockets[i] != null) {
				game.sockets[i].emit('data', dataPlayers);
			}
		}

	}


    /**
    *	A player is loading the game.
    */
    app.gameServices.updateLoadingProgress = function (socket, data) {

    	var game = app.gameServices.runningGames[data.gameId];

    	data.type = gameData.TO_CLIENT_SOCKET.updateLoadingProgress;

    	for (var i in game.players) {
    		var player = game.players[i];
    		if (player.id != data.playerId && game.sockets[i] != null) {
    			game.sockets[i].emit('data', data);
    		}
    	}
    	
    }


    /**
    *	A player sent an order.
    */

    app.gameServices.sendOrder = function (socket, data) {

    	var game = app.gameServices.runningGames[data.gameId];

    	if (game != null) {

    		game.orders.push([data.type, data.params]);

    	}  
    	
    }


	/**
	*	Sends the players the updated joinable games list.
	*/
	app.gameServices.notifyGamesListChanged = function (socket) {

		var availableGames = [];
		for (var i in app.gameServices.joinableGames) {
			var game = app.gameServices.joinableGames[i];

			availableGames.push(
				{
					id: game.id,
					creatorName: game.players[0].n,
					mapSize: game.map.size.name,
					initialResources: game.map.ir.name,
					objectives: gameData.VICTORY_CONDITIONS[Object.keys(gameData.VICTORY_CONDITIONS)[game.map.objectives]].name,
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
			for (var i in app.gameServices.playersWaiting) {
				app.gameServices.playersWaiting[i].emit('data', data);
			}

		}

	}


	/**
	*	Starts a game.
	*/
	app.gameServices.startGame = function (game) {

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
		app.gameServices.runningGames[game.id] = game;
		delete app.gameServices.joinableGames[game.id];

		// send game info to the players
		for (var i in game.players) {
			if(game.sockets[i] != null) {
				app.gameServices.sendGameInfo(game.sockets[i], game, i, false);
			}
		}

		// start the main games loop if it is stopped
		if (app.gameServices.loop == null) {
			app.gameServices.startLoop();
		}

		app.gameServices.notifyGamesListChanged();

	}


	/**
	*	Sends a player the game info he needs to initializes the game.
	*/
	app.gameServices.sendGameInfo = function (socket, game, playerIndex, gameIsRunning) {

		var data = {
			type: gameData.TO_CLIENT_SOCKET.gameStart,
			gameId: game.id,
			players: game.players,
			myArmy: playerIndex,
			map: game.map,
			initElements: game.gameElements,
			isRunning : gameIsRunning
		};

		socket.emit('data', data);

	}


	/**
	*	Starts main games loop.
	*/
	app.gameServices.startLoop = function () {

		console.log(new Date() + ' | Loop has started !'.success);

		app.gameServices.loop = setInterval(function () {

			for (var i in app.gameServices.runningGames) {
				
				var game = app.gameServices.runningGames[i];
				var gameover = app.gameServices.processGame(game);

				if (gameover) {

					// game is over
					app.gameServices.stopGame(game.id);

				}

			}

		}, 1000 / gameLogic.FREQUENCY);

	}


	/**
	*	Stops the update loop.
	*/
	app.gameServices.stopLoop = function () {

		console.log(new Date() + ' | Loop has just stopped !'.debug);

		clearInterval(app.gameServices.loop);
		app.gameServices.loop = null;

	}


	/**
	*	Processes one game loop.
	*/
	app.gameServices.processGame = function (game) {
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

						delete app.gameServices.playersIg[data.players[i].pid];

					}

				}

			}

			return app.gameServices.isUselessGame(game);

		} catch(e) {

			console.log(new Date() + ' : ' + e);

		}

		return false;
	}


	/**
	*	Stops a game.
	*/
	app.gameServices.stopGame = function (gameId) {
		
		console.log(new Date() + ' | One game has been stopped'.debug);

		delete app.gameServices.runningGames[gameId];

		// stop the loop if there are no more games
		if (Object.keys(app.gameServices.runningGames).length == 0) {
			
			app.gameServices.stopLoop();

		}

	}

	
	/**
	*	Stops the game if it is empty.
	*/
	app.gameServices.stopIfUselessGame = function (game) {

		if (app.gameServices.isUselessGame(game)) {

			if (game.players.length < game.nbPlayers) {

				console.log(new Date() + ' | One game has been canceled'.debug);

				delete app.gameServices.joinableGames[game.id];

			} else {

				app.gameServices.stopGame(game.id);

			}
			
		}

	}


	/**
	*	Checks if all the players have left the game.
	*/
	app.gameServices.isUselessGame = function (game) {

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
	app.gameServices.checkIfPlayerWasIG = function (socket, playerId) {

		var gameId = app.gameServices.playersIg[playerId];
		if (gameId != null) {
			var game = app.gameServices.runningGames[gameId];
			if (game != null) {
				for (var j in game.players) {
					if(game.players[j].pid == playerId && game.players[j].s == gameData.PLAYER_STATUSES.ig) {

			      		// ask player to rejoin game
				      	var data = {
				      		type: gameData.TO_CLIENT_SOCKET.rejoin,
				      		gameId: game.id,
				      		name: game.players[0].n,
				      		nbPlayers: game.nbPlayers
				      	}
				      	socket.emit('data', data);

						return;
					}
			  	}
			}
		}

	}


	/**
	*	The player rejoins a game.
	*/
	app.gameServices.rejoinGame = function (socket, data) {

		var game = app.gameServices.runningGames[data.gameId];

		if (game != null) {
			for (var i in game.players) {
				var player = game.players[i];
				if (player.pid == data.playerId) {
					game.sockets[i] = socket;
					app.gameServices.sendGameInfo(game.sockets[i], game, i, true);
					game.chat.push({ o: -1, text: player.n + ' is back !' });
					return;
				}
			}
		}

	}


	/**
	*	One player has just been disconnected.
	*/
	app.gameServices.disconnect = function (socket) {

		console.log(new Date() + ' | One player has been disconnected'.debug);
		
		// leave the room
		delete app.gameServices.playersWaiting[socket.id];
		
		// leave a running game
		for (var i in app.gameServices.runningGames) {

			var game = app.gameServices.runningGames[i];
			for (var j in game.sockets) {
				var s = game.sockets[j];
				if (s != null && s.id == socket.id) {
					game.sockets[j] = null;
					game.chat.push({ o: -1, text: game.players[j].n + ' has been disconnected' });
					return;
				}

			}

		}

		// leave a joinable game
		for (var i in app.gameServices.joinableGames) {

			var game = app.gameServices.joinableGames[i];
			for (var j in game.sockets) {
				var s = game.sockets[j];
				if (s != null && s.id == socket.id) {

					game.sockets.splice(j, 1);
					game.players.splice(j, 1);
			    	app.gameServices.notifyQueueChange(game);
			    	app.gameServices.stopIfUselessGame(game);
					return;

				}

			}

		}

	}

}
