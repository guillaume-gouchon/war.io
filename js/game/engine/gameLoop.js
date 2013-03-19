var gameLoop = {};

/**
*	Number of updates by second.
*/
gameLoop.FREQUENCY = 10;


/**
*	Loop counter.
*/
gameLoop.iterate = 0;


/**
*	Starts a game.
*/
gameLoop.start = function () {
	setInterval(function () {gameLoop.update()}, 1000 / this.FREQUENCY);
}


gameLoop.update = function () {
	this.iterate = (this.iterate > 100 ? 0 : this.iterate + 1);
	gameLogic.update();
}