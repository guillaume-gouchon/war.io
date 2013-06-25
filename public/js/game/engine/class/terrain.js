gameData.Terrain = function (land, x, y) {
	// personal data
	this.f = gameData.FAMILIES.land;// family of the element
	this.id = gameData.createUniqueId(this.f);// unique id
	this.t = land.t;// type
	this.r = 0;// race

	this.p = {x : x, y : y};// position

	//game-related data
	this.ra = land.ra; //resource amount

	this.toJSON = function () {
		return this;
	}
}