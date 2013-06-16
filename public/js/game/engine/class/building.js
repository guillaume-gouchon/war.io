gameData.Building = function (building, x, y, owner, isBuilt) {
	
	//personal data
	this.f = gameData.FAMILIES.building;// family of the element
	this.id = gameData.createUniqueId(this.f);// unique id
	this.t = building.t;// type
	this.o = owner;// owner's id
	this.r = building.r;// race

	//drawing-related data
	this.p = {x : x, y : y};
	
	//game-related data
	this.cp = (isBuilt ? 100 : 0);// construction progress
	this.rp = null;// where unit will go when created
	this.q = [];// queue
	this.qp = 0;// queue progression
	this.fr = 0;// frags
	this.l = building.l;// life

}
