var engineManager = {};


/**
* Sets up a new game.
*/
engineManager.createNewGame = function(map, players) {
	for (var i in players) {
		var player = players[i];
		for(var n in map.initialResources.resources) {
			player.resources.push(map.initialResources.resources[n].value);
		}

		for(var j in players) {
			if(j == i) {
				player.ranks.push(gameData.RANKS.me);
			} else {
				player.ranks.push(gameData.RANKS.enemy);
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
	gameLoop.start();
}


/**
*	Pauses the game.
*/
engineManager.pauseGame = function () {

}

