var gameManager = {};


/**
*	
*/
gameManager.iterate = 0;


/**
*	Handles the entire game loop.
*/
gameManager.updateGame = function () {
	this.iterate = (this.iterate > 1000 ? 0 : this.iterate + 1);
	if(this.iterate % 2 == 0) {
		gameLogic.updateGameLogic();
	}
	gameSurface.updateGameWindow();
	gameSurface.draw();
}


/**
* Sets up a new game and launch it.
*/
gameManager.createNewGame = function(map, players) {
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
	}

	mapLogic.createRandomMap (map, players);
	gameSurface.init();
	gameThread.startGame();

}


//start game
//TODO : remove and handle the game creation in a correct way
gameManager.myArmy = 0;
gameManager.players = [
	new gameData.Player(0, 0), new gameData.Player(1, 0) 
];
gameManager.createNewGame(gameData.RANDOM_MAPS.small, gameManager.players);
