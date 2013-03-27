gameData.Unit = function (unit, x, y, owner) {
	//personal data
	this.id = gameData.createUniqueId();
	this.f = gameData.FAMILIES.unit;
	this.t = unit.t;
	this.r = unit.r;
	this.o = owner;

	//drawing-related data
	this.p = {x : x, y : y};
	this.c = unit.c;

	//game-related data
	this.mt = {x : null, y : null};
	this.a = null;
	this.fr = 0;
	this.ga = null;
	this.pa = null;

	//fight-related data
	this.l = unit.l;
}

