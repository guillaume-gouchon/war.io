var engineManager = {};


/**
* Sets up a new game.
*/
engineManager.createNewGame = function(map, players) {
	for (var i in players) {
		var player = players[i];
		for(var n in map.ir.re) {
			player.re.push(map.ir.re[n].value);
		}
		for(var j in players) {
			if(j == i) {
				player.ra.push(gameData.RANKS.me);
			} else {
				player.ra.push(gameData.RANKS.enemy);
			}
		}
		gameLogic.players.push(player);
	}
	mapLogic.createNewMap(map, players);
}


/**
*	Starts the game.
*/
engineManager.startGame = function () {
}


/**
*	Pauses the game.
*/
engineManager.pauseGame = function () {

}


/**
*	Returns updated game data.
*/
engineManager.getGameData = function () {
	var data = {
		modified : gameLogic.modified,
		added: gameLogic.added,
		removed: gameLogic.removed,
		players: gameLogic.players
	}
	return data;
}


/**
*	Returns list of game elements.
*/
engineManager.getGameElements = function () {
	return gameLogic.gameElements;
}

