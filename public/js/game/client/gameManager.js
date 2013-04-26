var gameManager = {};


/**
*	Offline purpose variables.
*/
gameManager.isOfflineGame = false;
gameManager.offlineLoop = null;
gameManager.offlineNbPlayers = 2;


/**
*	The user wants to play the game.
*/
gameManager.initGame = function (gameInitData) {
	this.getPlayerId();
	if(this.isOfflineGame) {
		this.initOfflineGame(gameInitData);
	} else {
		try {
			this.connectToServer(gameInitData);
		} catch (e) {
		}
	}
}


/**
*	Starts the game.
*/
gameManager.startGame = function () {
	$('#playOffline').fadeOut();
	$('#gui').removeClass('hide');
	$('#introScreen').addClass('hide');

	gameContent.init(this.waitingData);

	if (this.isOfflineGame) {
		this.offlineLoop = setInterval(function(){
			gameContent.update(gameContent.game.update());
		}, 1000 / 8);
	}	

}


gameManager.initOfflineGame = function (gameInitData) {
	
	try {
		this.disconnect();
	} catch (e) {
	}

	gameContent.myArmy = 0;
	gameContent.players = [];
	gameContent.players.push(new gameData.Player(0, 0, gameInitData.army));
	for (var i = 1; i < this.offlineNbPlayers; i++) {
		gameContent.players.push(new gameData.Player(0, i, 0));
	}
  	gameContent.map = new gameData.Map(gameData.MAP_TYPES[gameInitData.mapType],
                    gameData.MAP_SIZES[gameInitData.mapSize],
                    gameData.VEGETATION_TYPES[gameInitData.vegetation],
                    gameData.INITIAL_RESOURCES[gameInitData.initialResources]);
	gameContent.game = gameCreation.createNewGame(gameContent.map, gameContent.players);
	this.waitingData = gameContent.game.gameElements;
	gameSurface.init();
	GUI.init();
	input.initInputs();
}


gameManager.connectToServer = function (gameInitData) {
	gameManager.socket = io.connect('http://warnode.com');
	
	//the server asked for some player's info
	this.socket.on('askUserData', function (data) {
		var userData = {
			player: {
				playerId: gameManager.playerId,
				army: gameInitData.army
			},
			game: gameInitData
		};
		gameManager.socket.emit('userData', userData);
	});

	//this player is the game creator, he can change the game data
	this.socket.on('gameCreator', function (gameId) {
		gameManager.showGameData(gameId);
	});

	//the server launched the game !
	this.socket.on('gameStart', function (data) {
		$('#nbPlayers').addClass('hide');
		gameContent.players = data.players;
		gameContent.myArmy = data.myArmy;
		gameContent.map = data.map;
		gameManager.waitingData = data.initElements;
		gameSurface.init();
		GUI.init();
		input.initInputs();
	});

	//the server sent the game data
	this.socket.on('gameData', function (data) {
		gameContent.update(data);
	});

	//show the game's stats when game is over
	this.socket.on('gameStats', function (data) {
		gameManager.showStats(data);
	});
}

gameManager.disconnect = function () {
	this.socket.emit('goOffline', null);
}


gameManager.createPlayerId = function () {
	var uniqId = new Date().getTime() + Math.random();
	utils.createCookie('rts_player_id', uniqId);
	return uniqId;
}


gameManager.getPlayerId = function () {
	var playerId = utils.readCookie('rts_player_id');
	if (playerId == null) {
		playerId = this.createPlayerId();
	}

	this.playerId = playerId;
}


gameManager.sendOrderToEngine = function (type, params) {
	if (this.isOfflineGame) {
		order.dispatchReceivedOrder(gameContent.game, type, params);
	} else {
		//send order to external server
		gameManager.socket.emit('order', [type, params]);
	}
}


gameManager.endGame = function (status) {
	if (status == gameData.PLAYER_STATUSES.victory) {
		$('#endGameMessage').addClass('victory');
		$('#endGameMessage').html('Victory !');
	} else {
		$('#endGameMessage').addClass('defeat');
		$('#endGameMessage').html('Defeat...');
	}
	$('#endGame').fadeIn();
	$('#endGameMessage').addClass('moveToLeft');

	if (this.isOfflineGame) {
		clearInterval(this.offlineLoop);
		this.showStats(gameContent.game.stats);
	} else {
		this.disconnect();
	}
}


/**
*	Shows the end game statistics.
*/
gameManager.showStats = function (stats) {
	$('table', '#endGameStats').css('width', window.innerWidth - 60);
	for (var i in stats) {
		var statPlayer = stats[i];
		var playerName;
		if (i == gameContent.myArmy) {
			playerName = 'You';
		} else {
			var playerNumber = 1 + parseInt(i);
			playerName = 'Player ' + playerNumber;
		}
		$('#tableBody').append('<tr class="' + gameSurface.PLAYERS_COLORS[i] + '"><td>' +  
			playerName + '</td><td>' +  
			statPlayer.killed + '</td><td>' +  
			statPlayer.lost + '</td><td>' +  
			statPlayer.buildingsDestroyed + '</td><td>' +  
			statPlayer.unitsCreated + '</td><td>' +  
			statPlayer.resources + '</td><td>' +  
			statPlayer.buildersCreated + '</td><td>' +  
			statPlayer.buildingsCreated + '</td></tr>');
	}
}


/**
*	Shows the different input and selectors to change the game data.
*/
gameManager.showGameData = function (gameId) {
	$('#nbPlayers').css('top', (window.innerHeight - $('#nbPlayers').height()) / 2);
	$('#nbPlayers').removeClass('hide');
	$('#nbPlayers').attr('data-gameId', gameId);

	$('div', '#nbPlayers').click(function () {
		try {
			var data = {};
			data.gameId = $('#nbPlayers').attr('data-gameId');
			data.nbPlayers = $(this).attr('data-value');
			gameManager.socket.emit('changeGameData', data);
		} catch (e) {
		}
		
	});
}

