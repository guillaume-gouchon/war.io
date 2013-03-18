gameData.Building = function (building, x, y, owner, isBuilt) {
	//personal data
	this.id = gameData.createUniqueId();
	this.family = gameData.FAMILIES.building;
	this.type = building.type;
	this.owner = owner;

	//drawing-related data
	this.position = {x : x, y : y};
	this.shape = building.shape;
	this.constructionColors = building.constructionColors;//used to show construction progression
	this.color = (isBuilt ? this.constructionColors[this.constructionColors.length - 1] : this.constructionColors[0]);;
	
	//game-related data
	this.selected = false;
	this.canBeBuiltHere = false;//used when chosing where to built
	this.constructionProgress = (isBuilt ? 100 : 0);
	this.timeConstruction = building.timeConstruction;//in seconds
	this.rallyingPoint = null;//where unit will go when created
	this.buttons = building.buttons;//actions available when this building is selected
	this.queue = [];
	this.queueProgression = 0;
	this.population = building.population;//increments or not max population
	this.needs = building.needs;//what we need to build it (resources, technologies...)

	//fight-related data
	this.life = building.life;
	this.defense = building.defense;
	this.armorType = building.armorType;
}
