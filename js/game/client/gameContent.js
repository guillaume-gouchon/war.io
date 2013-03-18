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
*	Tells which tile is occupied and which tile is free.
*/
gameContent.grid = [];


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
	//update game elements
	this.gameElements = gameLogic.gameElements;
	//update selected elements
	//grid
	this.grid = gameLogic.grid;
}

