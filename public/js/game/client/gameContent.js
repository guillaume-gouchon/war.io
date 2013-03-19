if(!gameManager.isOfflineGame) {
	var socket = io.connect('http://localhost:6969');
	
	socket.on('gameData', function (data) {
	    gameContent.gameElements = data.gameElements;
		gameContent.updateSelectedElements();
	});
}

var gameContent = {};


/**
*	Main variable used during the game.
*  	It contains all the maps' elements, units and buildings.
*/
gameContent.gameElements = [];


/**
*	Contains the current selected elements of gameElements.
*/
gameContent.selected = [];


/**
*	Contains the building that the user wants to construct.
*/
gameContent.building = null;


/**
*	Contains the coordinates of the selection rectangle.
*/
gameContent.selectionRectangle = [];


/**
*	Retrieves the game content from the game engine.	
*
*/
gameContent.updateGameContent = function() {
	this.gameElements = gameLogic.gameElements;
    gameContent.updateSelectedElements();
}

gameContent.updateSelectedElements = function () {
	for (var i in this.selected) {
		var selected = this.selected[i];
		for (var j in this.gameElements) {
			var gameElement = this.gameElements[j];
			if (gameElement.id == selected.id) {
				gameElement.isSelected = true;
				if (gameElement.family == gameData.FAMILIES.unit) {
					selected.action = gameElement.action;
					selected.patrol = gameElement.patrol;
					selected.moveTo = gameElement.moveTo;
				} else if (gameElement.family == gameData.FAMILIES.building) {
					selected.rallyingPoint = gameElement.rallyingPoint;
				}
				break;
			}
		}
	}
}