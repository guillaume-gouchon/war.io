gameData.Unit = function (unit, x, y, owner) {

	//personal data
	this.f = gameData.FAMILIES.unit;// family of the element
	this.id = gameData.createUniqueId(this.f);// unique id
	this.t = unit.t; // type
	this.r = unit.r; // race
	this.o = owner;  // owner's id

	this.p = {x : x, y : y};// position

	// game-related data
	this.mt = {x : null, y : null};// move destination
	this.a = null;// action
	this.fr = 0;// frags number
	this.ga = null;// gathering amount
	this.pa = null;// patrol action (second action)
	this.l = unit.l;// life

	// fixes the circular structure issue with JSON.stringify
	this.toJSON = function () {
		var action = null;
		if (this.a != null) {
			action = tools.clone(this.a);
		}
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
