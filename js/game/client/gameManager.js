var gameManager = {};


gameManager.isOfflineGame = true;


/**
*	Loop counter.
*/
gameManager.iterate = 0;


/**
*	Creates a new game.
*/
gameManager.createNewGame = function (map, players) {
	engineManager.createNewGame(map, players);
	gameSurface.init();
	input.initInputs();
	gameThread.start();
}


/**
*	Handles the entire game loop.
*/
gameManager.updateGame = function () {
	this.iterate = (this.iterate > 1000 ? 0 : this.iterate + 1);
	if(this.iterate % 2 == 0) {
		gameContent.updateGameContent();
	}
	GUI.update();
	gameWindow.update();
	gameSurface.draw();
}


function startGame() {
	//TODO : remove and handle the game creation in a correct way
	gameManager.myArmy = 0;
	gameManager.players = [
		new gameData.Player(0, 0), new gameData.Player(1, 0), new gameData.Player(2, 0), new gameData.Player(3, 0)
	];
	gameManager.map = new gameData.Map(gameData.MAP_TYPES.random,
										gameData.MAP_SIZES.small,
										gameData.VEGETATION_TYPES.standard,
										gameData.INITIAL_RESOURCES.standard);
	gameManager.createNewGame(gameManager.map, gameManager.players);
	engineManager.startGame();
}