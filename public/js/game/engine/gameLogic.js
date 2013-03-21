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
	if(element.mt != null && element.mt.x != null) {
		move.moveElement(element);
	}
}


/**
*	Depending on the action of the unit, change the destination,
*	and if close enough, resolve the action (build, fight...).
*/
gameLogic.resolveActions = function (element) {
	if (element.a != null) {
		var distance = tools.getElementsDistance(element, element.a);
		//dispatch orders
		if (distance <= 1) {
			//stop moving
			element.mt = {x : null, y : null};
			
			//close enough
			if (gameData.ELEMENTS[element.f][element.r][element.t].isBuilder && element.a.f == gameData.FAMILIES.building
				&& rank.isAlly(element.o, element.a)) {
				if(element.a.cp < 100) {
					//build
					action.doTheBuild(element, element.a);	
				} else {
					if(element.ga != null) {
						//come back with some resources
						production.getBackResources(element);
					}
					//TODO : repair
				}
			} else if (gameData.ELEMENTS[element.f][element.r][element.t].isBuilder && element.a.f == gameData.FAMILIES.terrain) {
				//gathering resources
				action.doTheGathering(element, element.a);
			} else if (!rank.isAlly(element.o, element.a)) {
				//attack
				action.doTheAttack(element, element.a);
			}
		} else {
			//move closer in order to do the action
			var closest = tools.getClosestPart(element, element.a);
			element.mt = {x : closest.x, y : closest.y};
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
		if (element.l <= 0 || element.ra == 0) {
			if (element.f == gameData.FAMILIES.terrain) {
			} else if (element.f == gameData.FAMILIES.building) {
				production.removeBuilding(element);
			} else if (element.f == gameData.FAMILIES.unit) {
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
	if (building.f == gameData.FAMILIES.building) {
		if (building.q.length > 0) {
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