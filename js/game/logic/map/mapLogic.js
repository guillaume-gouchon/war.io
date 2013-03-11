/**
*	Returns the nearest resource element.
*/
mapLogic.getNearestResource = function (element, resourceType) {
	var min = -1;
	var closestTerrain = null;
	for (var i in gameLogic.terrainElements) {
		var terrain = gameLogic.terrainElements[i];
		if (terrain.resourceType == resourceType) {
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
mapLogic.getNearestBuilding = function (element, buildingType) {
	var min = -1;
	var closestBuilding = null;
	for (var i in gameLogic.gameElements) {
		var building = gameLogic.gameElements[i];
		if (building.family == gameData.FAMILIES.building
		&& fightLogic.isAlly(building) && building.type == buildingType) {
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