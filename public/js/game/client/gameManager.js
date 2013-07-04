var gameManager = {};


/**
*	VARIABLES
*/
gameManager.isOfflineGame = false;
gameManager.offlineGameLoop = null;
gameManager.musicEnabled = false;


// connect to server
try {
	socketManager.connect();
} catch (e) {
}


/**
*	Returns player unique id from cookie or create it if it does not exist.
*/
gameManager.getPlayerId = function () {
	var playerId = utils.readCookie('rts_player_id');
	if (playerId == null) {
		var uniqueId = new Date().getTime() + Math.random();
		utils.createCookie('rts_player_id', uniqueId);
		playerId = uniqueId;
	}

	return playerId;
}


/**
*	Returns player unique id from cookie or create it if it does not exist.
*/
gameManager.getPlayerName = function () {
	var playerName = utils.readCookie('rts_player_name');
	if (playerName == null) {
		return 	gameData.getRandomName();
	} else {
		return playerName;
	}
}


/**
*	Updates player's name and updates the cookie.
*/
gameManager.updatePlayerName = function (newName) {
	utils.createCookie('rts_player_name', newName);
	this.playerName = newName;
}


/**
*	Send an order to the game engine.
*/
gameManager.sendOrderToEngine = function (type, params) {
	if (this.isOfflineGame) {
		gameContent.game.orders.push([type, params]);
	} else {
		socketManager.sendOrder(gameContent.game.id, type, params);
	}
}


/**
*	Creates game object from game information.
*/
gameManager.createGameObject = function (playerId, playerName, armyId, mapType, mapSize, initialResources, vegetation,  nbPlayers, nbIAPlayers) {
	return {
		playerId: playerId,
		playerName: playerName,
		armyId: armyId,
		mapType: mapType,
		mapSize: mapSize,
		initialResources: initialResources,
		vegetation: vegetation,
		nbPlayers: nbPlayers,
		nbIAPlayers: nbIAPlayers
	};
}


/**
*	The user starts a solo game against AI players.
*/
gameManager.startOfflineGame = function (game) {
	this.isOfflineGame = true;

	gameContent.myArmy = game.armyId;
	gameContent.players = [];
	gameContent.players.push(new gameData.Player(0, 0, game.armyId, false));
	gameContent.players[0].n = game.playerName;
	for (var i = 1; i < game.nbPlayers; i++) {
		gameContent.players.push(new gameData.Player(0, i, 0, true));
		gameContent.players[i].n = gameData.getRandomName();
	}
	gameContent.map = new gameData.Map(gameData.MAP_TYPES[Object.keys(gameData.MAP_TYPES)[game.mapType]],
		gameData.MAP_SIZES[Object.keys(gameData.MAP_SIZES)[game.mapSize]],
		gameData.VEGETATION_TYPES[Object.keys(gameData.VEGETATION_TYPES)[game.vegetation]],
		gameData.INITIAL_RESOURCES[Object.keys(gameData.INITIAL_RESOURCES)[game.initialResources]]);
	gameContent.game = gameCreation.createNewGame(gameContent.map, gameContent.players);
	this.waitingData = gameContent.game.gameElements;
	gameSurface.init();
	GUI.init();
}


/**
*	Updates my loading bar and notifies the server in online games.
*/
gameManager.updateLoadingProgress = function (progress) {
	$('.bar', '#loadingProgress').css('width', progress + '%');
	
	if (this.isOfflineGame) {
		if (progress >= 100) {
			this.startGame();
		}
	} else {
		if (progress >= 100 || Math.random() < 0.2) {// limits the number of sockets sent
			socketManager.updateLoadingProgress(progress);
		}
	}
}


/**
*	Starts the game.
*/
gameManager.startGame = function () {

	setTimeout(function () {
		// switch screen
		$('#game').removeClass('hide');
		$('#loadingScreen').remove();
	}, 500);

	gameContent.init(this.waitingData);

	if (this.isOfflineGame) {
		this.offlineGameLoop = setInterval(function(){
			gameContent.update(gameContent.game.update());
		}, 1000 / gameLogic.OFFLINE_FREQUENCY);

	}
}


/**
*	Updates salon.
*/
gameManager.updateJoinableGamesList = function (data) {

	$('tbody', '#lstGames').html('');
	if (data.games.length > 0) {
		$('.noResult', '#joinGame').addClass('hide');
		$('table', '#joinGame').removeClass('hide');
		for (var i in data.games) {
			var game = data.games[i];
			$('tbody', '#lstGames').append('<tr data-id="' + game.id + '">' 
				+ '<td>'+ game.creatorName + '</td><td>' + game.mapSize + '</td>'
				+ '<td>'+ game.initialResources + '</td><td>' + game.objectives + '</td>'
				+ '<td>' + game.players + '</td></tr>');
		}
	} else {
		$('.noResult', '#joinGame').removeClass('hide');
		$('table', '#joinGame').addClass('hide');
	}

	// confirm join game
	$('tbody tr', '#lstGames').click(function () {
		soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
		$(this).unbind('click');
		$('.modal').modal('hide');
		showLoadingScreen('Loading');

		var gameId = $(this).attr('data-id');
		var armyId = $('.checked', '#armies').attr('data-army');

		socketManager.joinGame(this.playerId, this.playerName, gameId, armyId);

		removeWebsiteDom();
	});

}


/**
*	The game is full, let's start to load the assets.
*/
gameManager.initOnlineGame = function (data) {
	gameContent.game.id = data.gameId;
	gameContent.players = data.players;
	gameContent.myArmy = data.myArmy;
	gameContent.map = data.map;
	this.waitingData = data.initElements;
	gameSurface.init();
	GUI.init();
}


/**
*	Updates the loading bars of the players. If everybody is ready, starts the game.
*/
gameManager.updateLoadingQueue = function (data) {
	var playersNeeded = data.nbPlayers - data.players.length;
	if (playersNeeded > 0) {
		$('#labelLoading').html('Waiting for ' + playersNeeded + ' more player' + (playersNeeded > 1 ? 's' : ''));
	} else {
		$('#labelLoading').html('Loading');
	}

	$('#igPlayersList').removeClass('hide').html('');
	var readyToGo = true;
	for (var i in data.players) {
		var player = data.players[i];
		if (player.progress < 100) { readyToGo = false;}
		$('#igPlayersList').append('<div class="' + gameSurface.PLAYERS_COLORS[i] + '" data-id="' + data.players[i].pid + '">' + data.players[i].n + (gameContent.myArmy == null || data.players[i].ready == 1 ? '':' (Loading Game...)') + '</div>');
	}

	if (readyToGo) {
		this.startGame();
	}
}


/**
*	Shows the game statistics.
*/
gameManager.showStats = function (playerStatus, stats) {

	// show victory / defeat message
	if (playerStatus == gameData.PLAYER_STATUSES.victory) {
		$('#endGameMessage').addClass('victory');
		$('#endGameMessage').html('Victory !');
	} else {
		$('#endGameMessage').addClass('defeat');
		$('#endGameMessage').html('Defeat...');
	}
	$('#endGame').removeClass('hide');

	// show stats
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
