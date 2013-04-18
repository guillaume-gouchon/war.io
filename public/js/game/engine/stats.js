var stats = {};


/**
* CONSTANTS
*/
stats.UPDATE_FREQUENCY = 100;


/**
*	Initializes the stats object.
*/
stats.init = function () {
	var initStatObject = {
		pop: [],
		killed: 0,
		lost: 0,
		buildingsDestroyed: 0,
		unitsCreated : 0,
		resources : 0,
		buildersCreated : 0,
		buildingsCreated : 0
	}
	for (var i in gameLogic.players) {
		gameLogic.stats.push(initStatObject);
	}
}


/**
*	Updates the stats.
*/
stats.update = function () {
	if(gameLoop.iterate % this.UPDATE_FREQUENCY == 0) {
		for (var i in gameLogic.players) {
			gameLogic.stats[i].pop.push(gameLogic.players[i].pop.current);
		}
	}
}


/*
*	Updates one stats' field.
*/
stats.updateField = function (owner, field, value) {
	gameLogic.stats[owner][field] += value;
}
