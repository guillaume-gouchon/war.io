gameData.Player = function (owner, race) {
	this.owner = owner;//id of the player
	this.race = race;//id of the race played

	this.resources = [];//list of resources and quantities owned
	this.ranks = [];//list of players ranks (enemy, neutral, ...)
	
	this.technologies = [];//researchs owned by the player, can be buildings

	this.population = {max : 0, current : 0};//player's population info

	//initializes player's population
	for(var i in gameData.BASECAMPS[this.race].buildings) {
		var building = gameData.BASECAMPS[this.race].buildings[i];
		if(building.population > 0) {
			this.population.max += building.population;
		}
	}
	for(var i in gameData.BASECAMPS[this.race].units) {
		var unit = gameData.BASECAMPS[this.race].units[i];
		if(unit.population > 0) {
			this.population.current += unit.population;
		}
	}
}
