var gameManager = {};


gameManager.isOfflineGame = true;


/**
*	The user wants to play the game.
*/
gameManager.playGame = function (gameInitData) {
	this.getPlayerId();

	document.getElementById('connecting').className = 'fullScreen';
	document.getElementById('introScreen').className += ' hide';

	if(!this.isOfflineGame) {
		gameSurface.init();
		input.initInputs();
		this.connectToServer(gameInitData);
	} else {
		this.startGame();
		this.initOfflineGame(gameInitData);
	}
}


/**
*	Starts the game.
*/
gameManager.startGame = function () {
	document.getElementById('connecting').className += ' hide';

	if (this.isOfflineGame) {
		setInterval(function(){
			gameContent.update(gameLoop.update());
		}, 1000 / 10);
	}
}


gameManager.initOfflineGame = function (gameInitData) {
	gameContent.myArmy = 0;
	gameContent.players = [
    new gameData.Player(0, 0, 0), new gameData.Player(0, 1, 0)];
  	gameContent.map = new gameData.Map(gameData.MAP_TYPES[gameInitData.mapType],
                    gameData.MAP_SIZES[gameInitData.mapSize],
                    gameData.VEGETATION_TYPES[gameInitData.vegetation],
                    gameData.INITIAL_RESOURCES[gameInitData.initialResources]);
	engineManager.createNewGame(gameContent.map, gameContent.players);

	gameSurface.init();
	input.initInputs();

	gameContent.init(engineManager.getGameElements());
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
		gameManager.startGame();
	});

	//the server sent the game data
	this.socket.on('gameData', function (data) {
		gameLogic.players = data.players;
		gameContent.update(data.gameData);
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
	console.log(params)
	if (this.isOfflineGame) {
		order.dispatchReceivedOrder(type, params);
	} else {
		//send order to external server
		gameManager.socket.emit('order', [type, params]);
	}
}