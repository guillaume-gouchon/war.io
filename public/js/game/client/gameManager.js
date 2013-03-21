var gameManager = {};


gameManager.isOfflineGame = false;


/**
*	Loop counter.
*/
gameManager.iterate = 0;


/**
*	Starts the game.
*/
gameManager.startGame = function () {
	gameSurface.init();
	input.initInputs();
	gameThread.start();


	document.getElementById('connecting').className += ' hide';
	document.getElementById('canvas').className = '';
}


/**
*	Updates the game content if offline, updates the display.
*/
gameManager.updateGame = function () {
	this.iterate = (this.iterate > 1000 ? 0 : this.iterate + 1);
	if(this.isOfflineGame && this.iterate % 2 == 0) {
		gameContent.updateGameContent();
	}
	GUI.update();
	gameWindow.update();
	gameSurface.draw();
}


gameManager.joinGame = function (gameInitData) {
	this.getPlayerId();

	document.getElementById('connecting').className = 'fullScreen';
	document.getElementById('introScreen').className += ' hide';

	if(!this.isOfflineGame) {
		this.connectToServer(gameInitData);
	} else {
		this.initOfflineGame(gameInitData);
		this.startGame();
	}
}

gameManager.initOfflineGame = function (gameInitData) {
	gameManager.myArmy = 0;
	var players = [
    new gameData.Player(0, 0, 0), new gameData.Player(0, 1, 0)];
  	gameManager.map = new gameData.Map(gameData.MAP_TYPES[gameInitData.mapType],
                    gameData.MAP_SIZES[gameInitData.mapSize],
                    gameData.VEGETATION_TYPES[gameInitData.vegetation],
                    gameData.INITIAL_RESOURCES[gameInitData.initialResources]);
	engineManager.createNewGame(this.map, players);
	gameLoop.start();
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
		gameLogic.players = data.players;
		gameManager.myArmy = data.myArmy;
		gameManager.map = data.map;
		gameManager.startGame();
	});

	//the server sent the game data
	this.socket.on('gameData', function (data) {
		gameLogic.players = data.players;
	    gameContent.gameElements = data.gameElements;
		gameContent.updateSelectedElements();
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