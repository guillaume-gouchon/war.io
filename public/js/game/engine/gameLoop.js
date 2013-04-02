var gameLoop = {};

/**
*	Number of updates by second.
*/
gameLoop.FREQUENCY = 8;


/**
*	Loop counter.
*/
gameLoop.iterate = 0;


gameLoop.update = function () {
	this.iterate = (this.iterate > 100 ? 0 : this.iterate + 1);
	gameLogic.update();
	return engineManager.getGameData();
}