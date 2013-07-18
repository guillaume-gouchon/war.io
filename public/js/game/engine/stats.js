var stats = {};


/**
* CONSTANTS
*/
stats.UPDATE_FREQUENCY = 100;


/**
*	Initializes the stats object.
*/
stats.init = function (game) {
	for (var i in game.players) {
		game.stats.push(
			{
				pop: [],
				killed: 0,
				lost: 0,
				buildingsDestroyed: 0,
				unitsCreated : 0,
				resources : 0,
				buildersCreated : 0,
				buildingsCreated : 0
			}
		);
	}
}


/**
*	Updates the stats.
*/
stats.update = function (game) {
	if(game.iterate % this.UPDATE_FREQUENCY == 0) {
		for (var i in game.players) {
			game.stats[i].pop.push([new Date().getTime(), game.players[i].pop.current]);
		}
	}
}


/*
*	Updates one stats' field.
*/
stats.updateField = function (game, owner, field, value) {
	game.stats[owner][field] += value;	
}


/**
*	Returns player's total game score.
*/
stats.getTotalScore = function (stats, nbTechs) {
	return stats.killed * 20 - stats.lost * 20 + stats.buildingsDestroyed * 100 + stats.unitsCreated * 10 
			+ stats.resources + stats.buildersCreated * 5 + stats.buildingsCreated * 20 + nbTechs * 500;
}