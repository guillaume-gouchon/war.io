var mapLogic = {};


/**
*	Returns the nearest resource element.
*/
mapLogic.getNearestResource = function (game, element, resourceType) {
	var min = -1;
	var closestTerrain = null;
	for (var i in game.gameElements[gameData.FAMILIES.land]) {
		var land = game.gameElements[gameData.FAMILIES.land][i];
		if (gameData.ELEMENTS[land.f][land.r][land.t].resourceType == resourceType) {
			var distance = tools.getElementsDistance(element, land);
			if(distance < 5) {
				return land;
			} else if (distance < min || min == -1) {
				min = distance;
				closestTerrain = land;
			}
		}
	}
	
	return closestTerrain;
}


/**
*	Returns the nearest friend building.
*/
mapLogic.getNearestBuilding = function (game, element, buildingType) {
	var min = -1;
	var closestBuilding = null;
	for (var i in game.gameElements[gameData.FAMILIES.building]) {
		var building = game.gameElements[gameData.FAMILIES.building][i];
		if (rank.isAlly(game.players, element.o, building) && building.t == buildingType) {
			var distance = tools.getElementsDistance(element, building);
			if(distance < 5) {
				return building;
			} else if (distance < min || min == -1) {
				min = distance;
				closestBuilding = building;
			}
		}
	}
	return closestBuilding;
}


/**
*	Returns the nearest enemy unit/building at vision range.
*/
mapLogic.getNearestEnemy = function (game, unit) {
	var vision = gameData.ELEMENTS[unit.f][unit.r][unit.t].vision;
	
	//check units
	for (var i in game.gameElements[gameData.FAMILIES.unit]) {
		var enemy = game.gameElements[gameData.FAMILIES.unit][i];
		if (rank.isEnemy(game.players, unit.o, enemy)) {
			var distance = tools.getElementsDistance(unit, enemy);
			if(distance <= vision) {
				return enemy;
			}
		}
	}

	//check buildings
	for (var i in game.gameElements[gameData.FAMILIES.building]) {
		var enemy = game.gameElements[gameData.FAMILIES.building][i];
		if (rank.isEnemy(game.players, unit.o, enemy)) {
			var distance = tools.getElementsDistance(unit, enemy);
			if(distance <= vision) {
				return enemy;
			}
		}
	}

	return null;
}