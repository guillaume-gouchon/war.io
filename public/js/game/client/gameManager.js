var gameManager = {};


/**
*	VARIABLES
*/
gameManager.isOfflineGame = false;
gameManager.offlineGameLoop = 0;
gameManager.musicEnabled = false;


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
		socketManager.sendOrder(gameContent.gameId, type, params);
	}
}


/**
*	Creates game object from game information.
*/
gameManager.createGameObject = function (playerId, playerName, armyId, mapType, mapSize, initialResources, vegetation, objectives, nbPlayers, iaPlayers) {
	return {
		playerId: playerId,
		playerName: playerName,
		armyId: armyId,
		mapType: mapType,
		mapSize: mapSize,
		initialResources: initialResources,
		vegetation: vegetation,
		objectives: objectives,
		nbPlayers: nbPlayers,
		iaPlayers: iaPlayers
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
	for (var i = 0; i < game.iaPlayers.length; i++) {
		var ownerId= i + 1;
		gameContent.players.push(new gameData.Player(ownerId, ownerId, game.iaPlayers[i], true));
		gameContent.players[ownerId].n = gameData.getRandomName();
	}

	gameContent.map = new gameData.Map(gameData.MAP_TYPES[Object.keys(gameData.MAP_TYPES)[game.mapType]],
		gameData.MAP_SIZES[Object.keys(gameData.MAP_SIZES)[game.mapSize]],
		gameData.VEGETATION_TYPES[Object.keys(gameData.VEGETATION_TYPES)[game.vegetation]],
		gameData.INITIAL_RESOURCES[Object.keys(gameData.INITIAL_RESOURCES)[game.initialResources]],
		game.objectives);
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

	if (this.isOfflineGame || gameContent.isRunning) {
		if (progress >= 100) {
			this.startGame();
		}
	} else {
		if (progress >= 100 || Math.random() < 0.2) {// limits the number of sockets sent
			socketManager.updateLoadingProgress(this.playerId, gameContent.gameId, progress);
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

	if (this.isOfflineGame && this.offlineGameLoop == 0) {
		this.offlineGameLoop = setInterval(function () {
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

		socketManager.joinGame(gameManager.playerId, gameManager.playerName, gameId, armyId);

		removeWebsiteDom();
	});

}


/**
*	The game is full, let's start to load the assets.
*/
gameManager.initOnlineGame = function (data) {
	gameContent.gameId = data.gameId;
	gameContent.players = data.players;
	gameContent.myArmy = data.myArmy;
	gameContent.map = data.map;
	gameContent.isRunning = data.isRunning;
	this.waitingData = data.initElements;
	gameSurface.init();
	GUI.init();
}


/**
*	Updates the loading queue.
*/
gameManager.updateQueue = function (data) {

	$('#playersLoading').removeClass('hide').html('');

	for (var i in data.players) {

		var player = data.players[i];
		if (this.playerId != player.pid) {
			$('#playersLoading').append('<div data-id="' + player.pid + '">'
				+ '<div class="color ' + gameSurface.PLAYERS_COLORS[i] + '">&nbsp;</div>'
				+ '<div class="name">' + player.n + '</div>'
				+ '<div class="progress"><div class="bar" style="width: 0%"></div>'
				+ '</div></div>');
		}

	}
	
}


/**
*	Updates the loading bars of the players. If everybody is ready, starts the game.
*/
gameManager.playersReady = [];
gameManager.updateLoadingQueue = function (data) {

	$('#labelLoading').html('Loading');
	$('.bar', 'div[data-id="' + data.playerId + '"]').css('width', data.loadingProgress + '%');

	if(data.loadingProgress >= 100 && this.playersReady.indexOf(data.playerId) == -1) {
		this.playersReady.push(data.playerId);
	}

	if (this.playersReady.length >= gameContent.players.length) {
		this.startGame();
	}

}


/**
*	Shows the game statistics.
*/
gameManager.showStats = function (playerStatus, gameStats) {

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
	var dataPopChart = [];
	for (var i in gameStats) {
		var statPlayer = gameStats[i];
		var player = gameContent.players[i];

		var totalTec = [];
		for (var i in player.tec) {
			var tech = player.tec[i];
			if (totalTec.indexOf(tech) == -1) {
				totalTec.push(tech);
			}
		}

		var scoreTotal = stats.getTotalScore(statPlayer, totalTec.length);
		$('tbody', '#endGame').append('<tr class="' + gameSurface.PLAYERS_COLORS[player.o] + '"><td>' +  
			player.n + '</td><td>' +  
			statPlayer.killed + '</td><td>' +  
			statPlayer.lost + '</td><td>' +  
			statPlayer.buildingsDestroyed + '</td><td>' +  
			statPlayer.unitsCreated + '</td><td>' +  
			statPlayer.resources + '</td><td>' +  
			statPlayer.buildersCreated + '</td><td>' + 
			statPlayer.buildingsCreated + '</td><td>' +  
			totalTec.length + '</td><td>' +  
			scoreTotal + '</td></tr>');

		dataPopChart.push(statPlayer.pop);
	}

	// population chart
	var options = {
		xaxis: {
			show: false
		},
		yaxis: {
			min: 0,
			autoscaleMargin: 1,
			position: 'right',
			tickDecimals: 0
		},
		colors: gameSurface.PLAYERS_COLORS
	};
	$("#popChart").css({
		height: '160px',
		width: window.innerWidth / 2,
		left: window.innerWidth / 4
	});

	$.plot($("#popChart"), dataPopChart, options);
	
}


/**
*	Shows a rejoin notification to the player.
*/
gameManager.askRejoin = function (data) {
	$('#notifications').removeClass('hide').append('<div class="notification rejoin blackBackground">'
		+ 'You were in a game. Do you want to rejoin it ?'
		+ '<div><button class="ok green">Yes</button><button class="no red">No</button></div>'
		+ '</div>');
	$('.ok', '.rejoin').click(function () {
		$(this).unbind('click');
		$('.modal').modal('hide');
		removeWebsiteDom();
		showLoadingScreen('Loading');
		socketManager.rejoinGame(gameManager.playerId, data.gameId);
		$('.rejoin').fadeOut();
	});
	$('.no', '.rejoin').click(function () {
		$('.rejoin').fadeOut();
	});
}
