gameData.Building = function (building, x, y, owner, isBuilt) {
	//personal data
	this.id = gameData.createUniqueId();
	this.family = gameData.FAMILIES.building;
	this.type = building.type;
	this.owner = owner;
	this.race = building.race;

	//drawing-related data
	this.position = {x : x, y : y};
	this.color = (isBuilt ? building.constructionColors[building.constructionColors.length - 1] : building.constructionColors[0]);;
	
	//game-related data
	this.selected = false;
	this.canBeBuiltHere = false;//used when chosing where to built
	this.constructionProgress = (isBuilt ? 100 : 0);
	this.rallyingPoint = null;//where unit will go when created
	this.queue = [];
	this.queueProgression = 0;

	//fight-related data
	this.life = building.life;
}
