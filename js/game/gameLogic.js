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
	this.updateToolbar();

	this.updateGrid(element);

	for(var n in this.gameElements) {
		var element  = this.gameElements[n];
		if(gameManager.iterate % 5 == 0) {
			this.resolveActions(element);
		}
		this.updateMoves(element);
		this.updateBuildings(element);
	}

	this.removeDeads();

	this.updateFogOfWar();
	this.checkGameOver();
}


/**
*	Updates the zoom of the window
*/
gameLogic.updateGameWindow = function () {
	this.PIXEL_BY_NODE = this.zoom;
}


/**
*	Updates the grid used for pathfinding.
*/
gameLogic.updateGrid = function (element) {
	//reset grid
	this.grid = tools.cloneObject(mapLogic.staticGrid);

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
*	Updates the toolbar.
*/
gameLogic.updateToolbar = function () { 
	GUI.updateToolbar();
}


/**
*	Updates moving units' positions.
*/
gameLogic.updateMoves = function (element) {
	if(element.moveTo != null && element.moveTo.x != null) {
		moveLogic.moveElement(element);
	}
}


/**
*	Depending on the action of the unit, change the destination,
*	and if close enough, resolve the action (build, fight...).
*/
gameLogic.resolveActions = function (element) {
	if (element.action != null) {
		var distance = tools.getElementsDistance(element, element.action);
		//dispatch orders
		if (distance <= 1) {
			//close enough
			if (element.isBuilder && element.action.family == gameData.FAMILIES.building
				&& fightLogic.isAlly(element.action)) {
				if(element.action.constructionProgress < 100) {
					//build
					actions.doTheBuild(element, element.action);	
				} else {
					if(element.gathering != null) {
						//come back with some resources
						buildLogic.getBackResources(element);
					}
					//TODO : repair
				}
			} else if (element.isBuilder && element.action.family == gameData.FAMILIES.terrain) {
				//gathering resources
				actions.doTheGathering(element, element.action);
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


/**
*	Removes dead units and destroyed buildings from gameElements.	
*/
gameLogic.removeDeads= function () {
	var n = gameLogic.gameElements.length;
	while (n--) {
		var element = gameLogic.gameElements[n]; 
		if (element.life <= 0 || element.resourceAmount == 0) {
			if (element.family == gameData.FAMILIES.terrain) {
				mapLogic.staticGrid[element.position.x][element.position.y].isWall = false;
			} else if (element.family == gameData.FAMILIES.building) {
				buildLogic.removeBuilding(element);
			} else if (element.family == gameData.FAMILIES.unit) {
				buildLogic.removeUnit(element);
			}
			fightLogic.removeElement(n);

			//remove from selection
			for(var i in gameLogic.selected) {
				if (gameLogic.selected[i].id == element.id) {
					gameLogic.selected.splice(i, 1);
					break;
				}
			}
		}
	}
}


/**
*	Stops the game if the winning conditions are reached.
*/
gameLogic.checkGameOver = function () {
}


/**
*	Updates buildings constructions, units production and research.
*/
gameLogic.updateBuildings = function (building) {
	if (building.family == gameData.FAMILIES.building) {
		if (building.queue.length > 0) {
			buildLogic.updateQueueProgress(building);
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