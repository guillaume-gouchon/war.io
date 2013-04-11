gameData.Building = function (building, x, y, owner, isBuilt) {
	//personal data
	this.id = gameData.createUniqueId();
	this.f = gameData.FAMILIES.building;//family of the element
	this.t = building.t;
	this.o = owner;
	this.r = building.r;

	//drawing-related data
	this.p = {x : x, y : y};
	
	//game-related data
	this.cp = (isBuilt ? 100 : 0);//construction progress
	this.rp = null;//where unit will go when created
	this.q = [];//queue
	this.qp = 0;//queue progression

	//fight-related data
	this.l = building.l;
}
