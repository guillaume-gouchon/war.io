var mapLogic = {};


/**
*	Returns the nearest resource element.
*/
mapLogic.getNearestResource = function (game, element, resourceType) {
	var min = -1;
	var closestTerrain = null;
	for (var i in game.gameElements) {
		var terrain = game.gameElements[i];
		if (terrain.f == gameData.FAMILIES.terrain 
			&& gameData.ELEMENTS[terrain.f][terrain.r][terrain.t].resourceType == resourceType) {
			var distance = tools.getElementsDistance(element, terrain);
			if(distance < 2) {
				return terrain;
			} else if (distance < min || min == -1) {
				min = distance;
				closestTerrain = terrain;
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
	for (var i in game.gameElements) {
		var building = game.gameElements[i];
		if (building.f == gameData.FAMILIES.building
		&& rank.isAlly(game.players, element.o, building) && building.t == buildingType) {
			var distance = tools.getElementsDistance(element, building);
			if(distance < 2) {
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
*	Returns the nearest enemy unit/building.
*/
mapLogic.getNearestEnemy = function (game, unit) {
	var min = -1;
	var closestEnemy = null;
	for (var i in game.gameElements) {
		var enemy = game.gameElements[i];
		if (enemy.f != gameData.FAMILIES.terrain 
			&& rank.isEnemy(game.players, unit.o, enemy)) {
			var distance = tools.getElementsDistance(unit, enemy);
			if(distance < 5) {
				return enemy;
			} else if (distance < min || min == -1) {
				min = distance;
				closestEnemy = enemy;
			}
		}
	}
	return closestEnemy;
}