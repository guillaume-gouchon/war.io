var gameData = {}


/**
*	Ids to categorize the different game elements.
*/
gameData.FAMILIES = {
	unit : 0,
	building : 1,
	terrain : 2
}


/**
*	Ids of the different armies.
*/
gameData.ARMIES = {
	human : 0
}


/**
*	Statuses ids of units and buildings' owners.
*/
gameData.STATUSES = {
	me : 0,
	ally : 1,
	neutral : 2,
	enemy : 3
}


/**
*	List of resources ids.
*/
gameData.RESOURCES = {
	wood : 0,
	gold : 1,
	stone : 2,
	food : 3
}


/**
* unitId : Global variable to get a unique id for each game element.
*/
gameData.unitId = 0;


/**
*	Creates a unique id for every unit and building.
*/
gameData.createUniqueId = function () {
	this.unitId += 10;
	var m = new Date().getMilliseconds();
	return m + this.unitId;
}
