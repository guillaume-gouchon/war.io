var actions = {};


actions.move = function (units, x, y) {
	for(var i in units) {
		var element = units[i];
		element.patrol = null;
		element.action = null;
		element.moveTo = {x : x, y : y};
	}
}


actions.attack = function (units, target) {
	for(var i in units) {
		var element = units[i];
		element.patrol = null;
		element.action = target;
	}
}


actions.build = function (units, building) {
	for(var i in units) {
		var element = units[i];
		element.patrol = null;
		element.action = building;
	}
}


actions.buildThatHere = function (builders, buildingType, x, y, owner) {
	var  building = new gameData.Building(buildingType, x, y, owner);
	buildLogic.startConstruction(building);
	this.build(builders, building);
}


actions.gather = function (units, resources) {
	for(var i in units) {
		var element = units[i];
		element.action = resources;
		element.patrol = resources;
	}
}
