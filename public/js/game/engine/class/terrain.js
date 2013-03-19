gameData.Terrain = function (terrain, x, y) {
	//personal data
	this.family = gameData.FAMILIES.terrain;
	this.type = terrain.type;
	this.race = 0;

	//drawing-related data
	this.position = {x : x, y : y};

	//game-related data
	this.resourceAmount = terrain.resourceAmount;
}