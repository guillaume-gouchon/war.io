var gameLoop = {};


/**
*	Number of time the game logic is being updated by second.
*/
gameLoop.FREQUENCY = 8;


/**
*	Loop counter.
*/
gameLoop.iterate = 0;


/**
*	Updates the game logic and returns updated elements.
*/
gameLoop.update = function () {
	this.iterate = (this.iterate > 100 ? 0 : this.iterate + 1);
	gameLogic.update();
	return gameLogic.getGameData();
}