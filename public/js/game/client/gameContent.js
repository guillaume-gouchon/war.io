var gameContent = {};


/**
*
*/
gameContent.map = null;
gameContent.players = null;
gameContent.myArmy = null;


/**
*	Main variable used during the game.
*  	It contains all the terrain's elements, units and buildings.
*/
gameContent.gameElements = {};


/**
*	Contains the current selected elements ids.
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
*
*/
gameContent.init = function (data) {
	//add new elements
	for (var i in data) {
		var element = data[i];
		gameSurface.addElement(element);
	}
}


/**
*	Updates the game content with the differences we have received from the engine.	
*/
gameContent.update = function (data) {
	//add new elements
	for (var i in data.added) {
		var element = data.added[i];
		if (this.gameElements[element.id] == null) {
			gameSurface.addElement(element);
		}
	}
	//remove some elements
	for (var i in data.removed) {
		var element = data.removed[i];
		if (this.gameElements[element.id] != null) {
			var index = this.selected.indexOf(element.id);
			if (index >= 0) {
				this.selected.splice(index, 1);
			}
			gameSurface.removeElement(element);
		}
	}
	//update some modified elements
	for (var i in data.modified) {
		var element = data.modified[i];
		if (this.gameElements[element.id] != null) {
			gameSurface.updateElement(element);
		}
	}
}

