gameData.Unit = function (unit, x, y, owner) {

	//personal data
	this.f = gameData.FAMILIES.unit;// family of the element
	this.id = gameData.createUniqueId(this.f);// unique id
	this.t = unit.t; // type
	this.r = unit.r; // race
	this.o = owner;  // owner's id

	this.p = {x : x, y : y};// position
	this.fl = 0;// animation flag

	// game-related data
	this.mt = {x : null, y : null};// move destination
	this.a = null;// action
	this.fr = 0;// frags number
	this.ga = null;// gathering amount
	this.pa = [];// patrol action (second action)
	this.l = unit.l;// life

	// fixes the circular structure issue with JSON.stringify
	this.toJSON = function () {
		var action = null, patrol = [];
		if (this.a != null) {
			action = tools.clone(this.a);
		}
		for (var i in this.pa) {
			patrol.push(tools.clone(this.pa[i]));
		}
		
		return {
			id: this.id,
			f: this.f,
			t: this.t,
			r: this.r,
			o: this.o,
			p: { x : this.p.x, y : this.p.y},
			fl: this.fl,
			mt: this.mt,
			fr: this.fr,
			ga: this.ga,
			pa: patrol,
			l: this.l,
			a: action
		}
	}

}
