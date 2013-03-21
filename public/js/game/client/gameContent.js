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
	var i = this.selected.length;
	while (i--) {
		var selected = this.selected[i];
		var stillAlive = false;
		for (var j in this.gameElements) {
			var gameElement = this.gameElements[j];
			if (gameElement.id == selected.id) {
				stillAlive = true;
				gameElement.isSelected = true;
				if (gameElement.f == gameData.FAMILIES.unit) {
					selected.a = gameElement.a;
					selected.pa = gameElement.pa;
					selected.mt = gameElement.mt;
				} else if (gameElement.f == gameData.FAMILIES.building) {
					selected.rp = gameElement.rp;
				}
				break;
			}
		}
		if (!stillAlive) {
			this.selected.splice(i, 1);	
		}
	}
}