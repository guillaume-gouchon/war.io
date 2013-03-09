gameData.Unit = function (unit, x, y, army) {
	//personal data
	this.id = gameData.createUniqueId();
	this.family = gameData.FAMILIES.unit;
	this.type = unit.type;
	this.speed = unit.speed;
	this.race = unit.race;
	this.army = army;

	//drawing-related data
	this.position = {x : x, y : y};
	this.shape = unit.shape;
	this.color = unit.color;

	//game-related data
	this.moveTo = {x : null, y : null};
	this.isSelected = false;
	this.isBuilder = unit.isBuilder;
	this.action = null;
	this.buttons = unit.buttons;
	this.timeConstruction = unit.timeConstruction;
	this.frags = 0;
	this.gatheringSpeed = unit.gatheringSpeed;
	this.maxGathering = unit.maxGathering;
	this.gathering = null;
	this.patrol = null;

	//fight-related data
	this.life = unit.life;
	this.attackSpeed = unit.attackSpeed;
	this.attack = unit.attack;
	this.defense = unit.defense;
	this.weaponType = unit.weaponType;
	this.armorType = unit.armorType;
}

