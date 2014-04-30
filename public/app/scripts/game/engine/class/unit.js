gameData.Unit = function (unit, x, y, owner) {

	// personal data
	this.f = gameData.FAMILIES.unit;// family of the element
	this.id = gameData.createUniqueId(this.f);// unique id
	this.t = unit.t; // type
	this.r = unit.r; // race
	this.o = owner;  // owner's id

	this.p = {x : x, y : y};// position
	this.fl = 0;// animation flag

	// game-related data
	this.a = null;// action
	this.pa = [];// actions to do after primary action done
	this.fr = 0;// frags number
	this.ga = null;// gathering amount
	this.l = unit.l;// life
	this.buff = [];// buff

	// fixes the circular structure issue with JSON.stringify
	this.toJSON = function () {
		var action = null;
		if (this.a != null) {
			action = this.a.toJSON();
		}
		return {
			id: this.id,
			f: this.f,
			t: this.t,
			r: this.r,
			o: this.o,
			p: { x : this.p.x, y : this.p.y},
			fl: this.fl,
			fr: this.fr,
			ga: this.ga,
			pa: this.pa,
			l: this.l,
			a: action
		}
	}

};
