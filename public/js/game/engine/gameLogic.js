var gameLogic = {};


/**
*	Game's stats.
*/
gameLogic.stats = [];


/**
*	Game players.
*/
gameLogic.players = [];


/**
*	Main variable used during the game.
*  	It contains all the terrain's elements, units and buildings.
*/
gameLogic.gameElements = [];


/**
*	Tells which tile is occupied and which tile is free.
*/
gameLogic.grid = [];


/**
*	List of elements modified during this game loop. 
*/
gameLogic.modified = [];
gameLogic.added = [];
gameLogic.removed = [];


/**
*	Buildings freshly created by the players.
*	Used to synchronize user's build action with the game engine loop.
*/
gameLogic.newBuildings = [];


/**
*	Updates all the data related to the game logic itself : positions, life, ...
* 	It also checks if the game is ending.
*/
gameLogic.update = function () {
	this.modified = [];
	this.added = [];
	this.removed = [];

	for (var n in this.players) {
		this.players[n].s = gameData.PLAYER_STATUSES.defeat;
	}

	for(var n in this.gameElements) {
		var element  = this.gameElements[n];
		if (element.f == gameData.FAMILIES.building) {
			this.players[element.o].s = gameData.PLAYER_STATUSES.ig;
		}
		this.resolveActions(element);
		this.updateMoves(element);
		this.updateBuildings(element);
	}
	this.addNewBuildings();
	this.removeDeads();
	this.checkGameOver();
	stats.update();
}


/**
* 	Synchronizes user's build actions with the game loop.
*/
gameLogic.addNewBuildings = function () {
	for (var i in this.newBuildings) {
		gameCreation.addGameElement (this.newBuildings[i]);
	}
	this.newBuildings = [];
}


/**
*	Updates moving units' positions.
*/
gameLogic.updateMoves = function (element) {
	if(element.mt != null && element.mt.x != null) {
		move.moveElement(element);
		tools.addUniqueElementToArray(this.modified, element);
	}
}


/**
*	Depending on the action of the unit, change the destination,
*	and if close enough, resolve the action (build, fight...).
*/
gameLogic.resolveActions = function (element) {
	if (element.a != null) {
		var elementData = gameData.ELEMENTS[element.f][element.r][element.t]
		var distance = tools.getElementsDistance(element, element.a);
		//is close enough ?
		if (distance <= 1) {
			//stop moving
			element.mt = {x : null, y : null};
			
			if (elementData.isBuilder && element.a.f == gameData.FAMILIES.building
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
			} else if (elementData.isBuilder && element.a.f == gameData.FAMILIES.terrain) {
				//gathering resources
				action.doTheGathering(element, element.a);
			} else if (!rank.isAlly(element.o, element.a)) {
				//attack
				action.doTheAttack(element, element.a);
			}
		} else if (distance <= elementData.range) {
			if (!rank.isAlly(element.o, element.a)) {
				//attack
				action.doTheAttack(element, element.a);
			}
		} else {
			//move closer in order to do the action
			var closest = tools.getClosestPart(element, element.a);
			element.mt = {x : closest.x, y : closest.y};
		}
		tools.addUniqueElementToArray(this.modified, element);
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
			gameCreation.removeGameElement(element);
		}
	}
}


/**
*	Updates buildings constructions, units production and research.
*/
gameLogic.updateBuildings = function (building) {
	if (building.f == gameData.FAMILIES.building) {
		if (building.q.length > 0) {
			production.updateQueueProgress(building);
			tools.addUniqueElementToArray(this.modified, building);
		}
	}
}


/**
*	Removes n-element from the gameElements array.
*/
gameLogic.removeElement = function (n) {
	this.gameElements.splice(n, 1);
}


/**
*	Only returns the updated game data.
*/
gameLogic.getGameData = function () {
	var data = {
		modified : this.modified,
		added: this.added,
		removed: this.removed,
		players: this.players
	}
	return data;
}


/**
*	Returns the full list of game elements.
*/
gameLogic.getGameElements = function () {
	return this.gameElements;
}


/**
*	Stops the game if the winning conditions are reached.
*/
gameLogic.checkGameOver = function () {
	var nbPlayersDefeated = 0;
	var victory = -1;
	for (var i in this.players) {
		if (this.players[i].s == gameData.PLAYER_STATUSES.defeat) {
			nbPlayersDefeated++;
		} else {
			victory = this.players[i].o;
		}
	}

	if (nbPlayersDefeated == this.players.length - 1) {
		this.players[victory].s = gameData.PLAYER_STATUSES.victory;
	}
}
