var socketManager = {};


/**
*	VARIABLES
*/
socketManager.socket = null;


/**
*	Connects the client to the server.
*/
socketManager.connect = function () {

	this.socket = io.connect();

	this.socket.on('data', function (data) {
		socketManager.onDataSocket(data);
	});

	this.socket.on('gameData', function (data) {
		socketManager.onGameDataSocket(data);
	});

}


/**
*	WEBSOCKETS INPUT
*/
socketManager.onDataSocket = function (data) {

	switch (data.type) {

		case gameData.TO_CLIENT_SOCKET.login :
			this.sendSocketToServer(gameData.TO_SERVER_SOCKET.login, gameManager.playerId);
			break;

		case gameData.TO_CLIENT_SOCKET.listJoinableGames :
			gameManager.updateJoinableGamesList(data);
			break;

		case gameData.TO_CLIENT_SOCKET.gameStart :
			gameManager.initOnlineGame(data);
			break;

		case gameData.TO_CLIENT_SOCKET.rejoin :
			gameManager.askRejoin(data);
			break;

		case gameData.TO_CLIENT_SOCKET.updateLoadingProgress :
			gameManager.updateLoadingQueue(data);
			break;

		case gameData.TO_CLIENT_SOCKET.updateQueue :
			gameManager.updateQueue(data);
			break;

		case gameData.TO_CLIENT_SOCKET.gameStats :
			gameManager.showStats(data.playerStatus, data.stats);
			break;

	}
}

socketManager.onGameDataSocket = function (data) {
	gameContent.update(data);
}


/**
*	WEBSOCKETS OUTPUT
*/
socketManager.createNewGame = function (data) {
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.createNewGame, data);
}

socketManager.enterSalon = function () {
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.enterSalon, null);
}

socketManager.leaveSalon = function () {
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.leaveSalon, null);
}

socketManager.joinGame = function (playerId, playerName, gameId, armyId) {
	var data = {
		playerId: playerId,
		playerName: playerName,
		gameId: gameId,
		armyId: armyId
	}
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.joinGame, data);
}

socketManager.updateLoadingProgress = function (playerId, gameId, loadingProgress) {
	var data = {
		playerId: playerId,
		gameId: gameId,
		loadingProgress: loadingProgress
	}
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.updateLoadingProgress, data);
}

socketManager.sendOrder = function (gameId, orderType, params) {
	var data = {
		gameId: gameId,
		type: orderType,
		params: params
	};
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.sendOrder, data);
}

socketManager.rejoinGame = function (playerId, gameId) {
	var data = {
		playerId: playerId,
		gameId: gameId
	};
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.rejoinGame, data);
}

socketManager.sendSocketToServer = function (socketType, data) {
	this.socket.emit(socketType, data);
}
