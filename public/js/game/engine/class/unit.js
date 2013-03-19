gameData.Unit = function (unit, x, y, owner) {
	//personal data
	this.id = gameData.createUniqueId();
	this.family = gameData.FAMILIES.unit;
	this.type = unit.type;
	this.race = unit.race;
	this.owner = owner;

	//drawing-related data
	this.position = {x : x, y : y};

	//game-related data
	this.moveTo = {x : null, y : null};
	this.isSelected = false;
	this.action = null;
	this.frags = 0;
	this.gathering = null;
	this.patrol = null;

	//fight-related data
	this.life = unit.life;
}

