var gameThread = {};


/**
*	Number of frames per second
**/
gameThread.FPS = 25;


/**
*	Starts the main game thread
*/
gameThread.startGame = function () {
	setInterval(function(){gameManager.updateGame()}, 1000 / this.FPS);
}
