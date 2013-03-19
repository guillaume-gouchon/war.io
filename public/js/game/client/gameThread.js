var gameThread = {};


/**
*	Number of frames per second
**/
gameThread.FPS = 30;


/**
*	Starts the main game thread
*/
gameThread.start = function () {
	setInterval(function(){gameManager.updateGame()}, 1000 / this.FPS);
}
