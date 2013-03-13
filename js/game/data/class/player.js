gameData.Player = function (owner, race) {
	this.owner = owner;
	this.race = race;
	this.resources = [];
	this.ranks = [];


	//initializes player's population
	this.population = {max : 0, current : 0};
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
