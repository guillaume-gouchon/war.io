gameData.Unit = function (unit, x, y, owner) {
	//personal data
	this.id = gameData.createUniqueId();
	this.f = gameData.FAMILIES.unit;
	this.t = unit.t;
	this.r = unit.r;
	this.o = owner;

	this.p = {x : x, y : y};//position

	//game-related data
	this.mt = {x : null, y : null};//move to
	this.a = null;//action
	this.fr = 0;//frags number
	this.ga = null;//gathering amount
	this.pa = null;//patrol action

	//fight-related data
	this.l = unit.l;

	//fixes the circular structure issue with JSON.stringify
	this.toJSON = function () {
		var action = null;
		if (this.a != null) {
			action = tools.clone(this.a);
		}
		console.log(this);
		return {
			id: this.id,
			f: this.f,
			t: this.t,
			r: this.r,
			o: this.o,
			p: this.p,
			mt: this.mt,
			fr: this.fr,
			ga: this.ga,
			pa: this.pa,
			l: this.l,
			a: action
		}
	}
}

