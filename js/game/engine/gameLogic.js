var gameLogic = {};


/**
*	Game players.
*/
gameLogic.players = [];


/**
*	Main variable used during the game.
*  	It contains all the maps' elements, units and buildings.
*/
gameLogic.gameElements = [];


/**
*	Tells which tile is occupied and which tile is free.
*/
gameLogic.grid = [];


/**
*	Updates all the data related to the game logic itself : positions, life, ...
* 	It also checks if the game is ending.
*/
gameLogic.update = function() {
	for(var n in this.gameElements) {
		var element  = this.gameElements[n];
		this.resolveActions(element);
		this.updateMoves(element);
		this.updateBuildings(element);
	}

	this.updateFogOfWar();
	this.removeDeads();
	this.checkGameOver();
}


/**
*	Updates moving units' positions.
*/
gameLogic.updateMoves = function (element) {
	if(element.moveTo != null && element.moveTo.x != null) {
		move.moveElement(element);
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
			//stop moving
			element.moveTo = {x : null, y : null};
			
			//close enough
			if (element.isBuilder && element.action.family == gameData.FAMILIES.building
				&& rank.isAlly(element.action)) {
				if(element.action.constructionProgress < 100) {
					//build
					action.doTheBuild(element, element.action);	
				} else {
					if(element.gathering != null) {
						//come back with some resources
						production.getBackResources(element);
					}
					//TODO : repair
				}
			} else if (element.isBuilder && element.action.family == gameData.FAMILIES.terrain) {
				//gathering resources
				action.doTheGathering(element, element.action);
			} else if (!rank.isAlly(element.action)) {
				//attack
				action.doTheAttack(element, element.action);
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
			} else if (element.family == gameData.FAMILIES.building) {
				production.removeBuilding(element);
			} else if (element.family == gameData.FAMILIES.unit) {
				production.removeUnit(element);
			}
			this.removeElement(n);
			mapLogic.removeGameElement(element);

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
			production.updateQueueProgress(building);
		}
	}
}


/**
*	Updates the fog of war grid.
*/
gameLogic.updateFogOfWar = function () {
	
}


/**
*	Removes n-element from the gameElements array.
*/
gameLogic.removeElement = function (n) {
	this.gameElements.splice(n, 1);
}