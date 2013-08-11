gameData.Player = function (playerId, owner, race, isAI) {
	this.pid = playerId;// unique server id
	this.o = owner;// id of the player in the game
	this.r = race;// id of the race played
	this.n = '';// player's name

	this.re = [];// list of resources and quantities owned
	this.ra = [];// list of players ranks (enemy, neutral, ...)
	this.s = gameData.PLAYER_STATUSES.ig;//player's status
	
	this.tec = [];// researchs owned by the player, can be buildings
	this.tecC = [];// researchs being researched

	this.pop = {max : 0, current : 0};// player's population info

    this.ai = false;

    if (typeof isAI != 'undefined') {// check if the player is an AI
        if (isAI) {
            this.ai = true;
        }
    }

	// initializes player's population
	for(var i in gameData.BASECAMPS[this.r].buildings) {
		var building = gameData.BASECAMPS[this.r].buildings[i];
		if(building.pop > 0) {
			this.pop.max += building.pop;
		}
	}
	for(var i in gameData.BASECAMPS[this.r].units) {
		var unit = gameData.BASECAMPS[this.r].units[i];
		if(unit.pop > 0) {
			this.pop.current += unit.pop;
		}
	}
};
