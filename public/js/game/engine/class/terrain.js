gameData.Terrain = function (terrain, x, y) {
	//personal data
	this.id = gameData.createUniqueId();
	this.f = gameData.FAMILIES.terrain;
	this.t = terrain.t;
	this.r = 0;

	//drawing-related data
	this.p = {x : x, y : y};

	//game-related data
	this.ra = terrain.ra; //resource amount
}