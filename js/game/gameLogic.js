var gameLogic = {};


/**
*	Manages the current zoom of the game window
*/
gameLogic.PIXEL_BY_NODE = 15;
gameLogic.ZOOM_MAX = 30;
gameLogic.ZOOM_MIN = 10;
gameLogic.zoom = gameLogic.PIXEL_BY_NODE;


/**
*	Main variable used during the game.
*  	It contains all the maps' elements, units and buildings.
*/
gameLogic.gameElements = [];


/**
*	Contains the current selected elements of gameElements.
*/
gameLogic.selected = [];


/**
*	Contains the building that the user wants to construct.
*/
gameLogic.building = null;


/**
*	Contains the coordinates of the selection rectangle.
*/
gameLogic.selectionRectangle = [];


/**
*	Tells which tile is occupied and which tile is free.
*/
gameLogic.grid = [];


/**
*	Updates all the data related to the game logic itself : positions, life, ...
* 	It also checks if the game is ending.
*/
gameLogic.updateGameLogic = function() {
	this.updateGameWindow();
	this.updateGrid();
	this.resolveActions();
	this.updateMoves();
	this.removeDeads();
	this.checkGameOver();
	this.updateBuildings();
	this.updateFogOfWar();
}


/**
*	Updates the zoom of the window
*/
gameLogic.updateGameWindow = function () {
	this.PIXEL_BY_NODE = this.zoom;
}


/**
*	Updates the grid used for A*.
*/
gameLogic.updateGrid = function () {
	this.grid = mapLogic.staticGrid;
	for(var n in this.gameElements) {
		var element  = this.gameElements[n];
		for(var i in element.shape) {
			var row = element.shape[i];
			for(var j in row) {
				var part = row[j];
				if(part > 0) {
					var position = tools.getPartPosition(element, i, j);
					this.grid[position.x][position.y].isWall = true;
				}
			}
		}
	}
}


/**
*	Updates moving units' positions.
*/
gameLogic.updateMoves = function () {
	for(var i in this.gameElements) {
		var element  = this.gameElements[i];
		if(element.moveTo != null && element.moveTo.x != null) {
			moveLogic.moveElement(element);
		}
	}
}


/**
*	Depending on the action of the unit, change the destination,
*	and if close enough, resolve the action (build, fight...).
*/
gameLogic.resolveActions = function () {
	if(gameManager.iterate % 5 == 0) {
		for (var i in gameLogic.gameElements) {
			var element = gameLogic.gameElements[i];
			if (element.action != null) {
				var distance = tools.getElementsDistance(element, element.action);
				//dispatch orders
				if (distance <= 2) {
					//close enough
					if (element.isBuilder && element.action.family == gameData.FAMILIES.building
						&& fightLogic.isAlly(element.action)) {
						//build / repair
						actions.doTheBuild(element, element.action);
					} else if (!fightLogic.isAlly(element.action)) {
						//attack
						actions.doTheAttack(element, element.action);
					}
				} else {
					//move closer in order to do the action
					var closest = tools.getClosestPart(element, element.action);
					element.moveTo = {x : closest.x, y : closest.y};
				}

			}
		}
	}
}


/**
*	Removes dead units and destroyed buildings from gameElements.	
*/
gameLogic.removeDeads= function () {
	var n = gameLogic.gameElements.length;
	while(n--) {
		if(gameLogic.gameElements[n].life <= 0) {
			fightLogic.removeElement(n);
		}
	}
}


/**
*	Stops the game if the winning conditions are reached.
*/
gameLogic.checkGameOver = function () {
}


/**
*	Updates buildings constructions, units and research.
*/
gameLogic.updateBuildings = function () {
	for (var i in gameLogic.gameElements) {
		if (gameLogic.gameElements[i].family == gameData.FAMILIES.building) {
			var building = gameLogic.gameElements[i];
			if (building.queue.length > 0) {
				buildLogic.updateQueueProgress(building);
			}
			//TODO : research

		}
	}
}


/**
*	Returns the position of the specified element in the gameElements array.
*/
gameLogic.getPositionInGameElements = function (id) {
	for (var i in gameLogic.gameElements) {
		if(gameLogic.gameElements[i].id == id) {
			return i;
		}
	}
	return -1;
}


/**
*	Updates the fog of war grid.
*/
gameLogic.updateFogOfWar = function () {
	
}