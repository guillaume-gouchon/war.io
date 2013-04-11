gameData.Unit = function (unit, x, y, owner) {
	//personal data
	this.id = gameData.createUniqueId();
	this.f = gameData.FAMILIES.unit;
	this.t = unit.t;
	this.r = unit.r;
	this.o = owner;

	//drawing-related data
	this.p = {x : x, y : y};

	//game-related data
	this.mt = {x : null, y : null};//move to
	this.a = null;//action
	this.fr = 0;//frags number
	this.ga = null;//gathering amount
	this.pa = null;//patrol action

	//fight-related data
	this.l = unit.l;
}

