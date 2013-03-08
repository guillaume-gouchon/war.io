gameData.Terrain = function (terrain, x, y) {
	//personal data
	this.family = gameData.FAMILIES.terrain;
	this.type = terrain.type;

	//drawing-related data
	this.position = {x : x, y : y};
	this.shape = terrain.shape;
	this.color = terrain.color;

	//game-related data
	this.canMoveIn = terrain.canMoveIn;
}