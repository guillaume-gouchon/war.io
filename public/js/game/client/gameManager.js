var gameManager = {};


/**
*	Offline purpose variables.
*/
gameManager.isOfflineGame = false;
gameManager.offlineLoop = null;
gameManager.offlineNbPlayers = 2;
gameManager.playerId = null;
gameManager.playerName = null;
gameManager.musicEnabled = false;


/**
*	The user wants to play the game.
*/
gameManager.initGame = function (gameInitData) {
	if (gameContent.game == null) {//avoids to run the game twice
		this.playerId = this.getPlayerId();
		this.playerName = this.getPlayerName();
		if(this.isOfflineGame) {
			this.initOfflineGame(gameInitData);
		} else {
			try {
				this.connectToServer(gameInitData);
			} catch (e) {
			}
		}
	}
}


/**
*	Starts the game.
*/
gameManager.startGame = function () {
	$('#gui').removeClass('hide');
	$('#introScreen').remove();

	gameContent.init(this.waitingData);

	if (this.isOfflineGame) {
		this.offlineLoop = setInterval(function(){
			gameContent.update(gameContent.game.update());
		}, 1000 / 8);
	}	

}


gameManager.initOfflineGame = function (gameInitData) {
	gameContent.myArmy = 0;
	gameContent.players = [];
	gameContent.players.push(new gameData.Player(0, 0, gameInitData.army));
	gameContent.players[0].n = this.playerName;
	for (var i = 1; i < this.offlineNbPlayers; i++) {
		gameContent.players.push(new gameData.Player(0, i, 0));
		gameContent.players[i].n = 'AI';
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
	
	var userData = {
		player: {
			playerId: this.playerId,
			army: gameInitData.army,
			name: this.playerName
		},
		game: gameInitData
	};
	this.socket.emit('enter', userData);

	//a player has joined the game
	this.socket.on('updateGamePlayers', function (data) {
		gameManager.updatePlayersInGame(data);
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

	return playerId;
}

gameManager.getPlayerName = function () {
	var playerName = utils.readCookie('rts_player_name');
	if (playerName == null) {
		return 	'Lord Bobby ' + parseInt(Math.random() * 10);
	} else {
		return playerName;
	}
}

gameManager.updatePlayerName = function (newName) {
	utils.createCookie('rts_player_name', newName);
	this.playerName = newName;
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
	$('#endGame').fadeIn().removeClass('hide');
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
		var playerName = gameContent.players[i].n;
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


gameManager.updatePlayersInGame = function (data) {
	var playersNeeded = data.playersMax - data.players.length;
	$('#loadingLabel').html('Waiting for ' + playersNeeded + ' player' + (playersNeeded > 1 ? 's' : ''));
}





