gameData.Terrain = function (land, x, y) {
	//personal data
	this.id = gameData.createUniqueId();
	this.f = gameData.FAMILIES.land;
	this.t = land.t;
	this.r = 0;

	//drawing-related data
	this.p = {x : x, y : y};

	//game-related data
	this.ra = land.ra; //resource amount
}