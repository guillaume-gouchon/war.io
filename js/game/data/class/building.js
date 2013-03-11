gameData.Building = function (building, x, y, owner, isBuilt) {
	//personal data
	this.id = gameData.createUniqueId();
	this.family = gameData.FAMILIES.building;
	this.type = building.type;
	this.owner = owner;

	//drawing-related data
	this.position = {x : x, y : y};
	this.shape = building.shape;
	this.constructionColors = building.constructionColors;
	this.color = (isBuilt ? this.constructionColors[this.constructionColors.length - 1] : this.constructionColors[0]);;
	
	//game-related data
	this.selected = false;
	this.canBeBuiltHere = false;
	this.constructionProgress = (isBuilt ? 100 : 0);
	this.timeConstruction = building.timeConstruction;//in seconds
	this.rallyingPoint = null;
	this.buttons = building.buttons;
	this.queue = [];
	this.queueProgression = 0;
	this.population = building.population;
	this.needs = building.needs;

	//fight-related data
	this.life = building.life;
	this.defense = building.defense;
	this.armorType = building.armorType;
}
