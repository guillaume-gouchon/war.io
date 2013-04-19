var gameManager = {};


/**
*	Testing purpose variable.
*/
gameManager.isOfflineGame = true;
gameManager.offlineLoop = null;


/**
*	The user wants to play the game.
*/
gameManager.initGame = function (gameInitData) {
	this.getPlayerId();
	
	if(!this.isOfflineGame) {
		this.connectToServer(gameInitData);
	} else {
		this.initOfflineGame(gameInitData);	
	}
}


/**
*	Starts the game.
*/
gameManager.startGame = function () {
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
	gameContent.myArmy = 0;
	gameContent.players = [
    new gameData.Player(0, 0, gameInitData.army), new gameData.Player(0, 1, 0)];
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
	gameManager.socket = io.connect('http://localhost:6969');
	
	//the server asked for some player's info
	this.socket.on('askUserData', function (data) {
		var userData = {};
		userData.playerId = gameManager.playerId;
		userData.gameInitData = gameInitData;
		gameManager.socket.emit('userData', userData);
	});

	//the server launched the game !
	this.socket.on('gameStart', function (data) {
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
	}
}


/**
*	Shows the game statistics.
*/
gameManager.showStats = function (stats) {
	$('table', '#endGameStats').css('width', window.innerWidth - 60);
	for (var i in stats) {
		var statPlayer = stats[i];
		var playerName;
		if (i == gameContent.myArmy) {
			playerName = 'You';
		} else {
			playerName = 'Player ' + i;
		}
		$('#tableBody').append('<tr class="black"><td>' +  
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