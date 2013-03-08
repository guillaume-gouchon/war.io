var actions = {};


actions.move = function (units, x, y) {
	for(var i in units) {
		var element = units[i];
		element.action = null;
		element.moveTo = {x : x, y : y};
	}
}


actions.attack = function (units, target) {
	for(var i in units) {
		var element = units[i];
		element.action = target;
	}
}


actions.build = function (units, building) {
	for(var i in units) {
		var element = units[i];
		element.action = building;
	}
}


actions.buildThatHere = function (builders, buildingType, x, y, army) {
	var  building = new gameData.Building(buildingType, x, y, army);
	buildLogic.startConstruction(building);
	this.build(builders, building);
}
