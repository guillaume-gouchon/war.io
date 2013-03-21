var gameManager = {};


gameManager.isOfflineGame = false;


/**
*	Loop counter.
*/
gameManager.iterate = 0;


/**
*	Creates a new game.
*/
gameManager.startGame = function () {
	if(this.isOfflineGame) {
		gameManager.myArmy = 0;
		var players = [
	    new gameData.Player(0, 0, 0), new gameData.Player(0, 1, 0)];
	  	gameManager.map = new gameData.Map(gameData.MAP_TYPES.random,
	                    gameData.MAP_SIZES.small,
	                    gameData.VEGETATION_TYPES.standard,
	                    gameData.INITIAL_RESOURCES.standard);
		engineManager.createNewGame(this.map, players);
		gameLoop.start();
	}

	gameSurface.init();
	input.initInputs();
	gameThread.start();


	document.getElementById('connecting').className += ' hide';
	document.getElementById('canvas').className = '';
}


/**
*	Handles the entire game loop.
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


gameManager.joinGame = function () {
	this.getPlayerId();

	document.getElementById('connecting').className = 'fullScreen';
	document.getElementById('playButton').className += ' hide';

	if(!this.isOfflineGame) {
		this.connectToServer();
	} else {
		this.startGame();
	}
}


gameManager.connectToServer = function () {
	gameManager.socket = io.connect('http://localhost:6969');
	
	//the server asked for some player's info
	this.socket.on('askUserData', function (data) {
		var userData = {};
		userData.playerId = gameManager.playerId;
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