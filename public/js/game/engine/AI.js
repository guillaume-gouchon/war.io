var AI = {};


/**
*	CONSTANTS
*/
AI.RESOURCE_DISTANCE_THRESHOLD = 10;
AI.ENEMY_DISTANCE_THRESHOLD = 20;


/**
*	Search for new resources to gather.
*/
AI.searchForNewResources = function (game, builder, fromWhere, resourceType) {
	var nearestResource = mapLogic.getNearestResource(game, fromWhere, resourceType);
	if(tools.getElementsDistance(fromWhere, nearestResource) < this.RESOURCE_DISTANCE_THRESHOLD) {
		builder.a = nearestResource;
		builder.pa = nearestResource;
	} else {
		builder.a = null;
		builder.pa = null;
	}
}


/**
*	Search for new enemy to attack.
*/
AI.searchForNewEnemy = function (game, unit) {
	var nearestEnemy = mapLogic.getNearestEnemy(game, unit);
	if(nearestEnemy != null && tools.getElementsDistance(unit, nearestEnemy) < this.ENEMY_DISTANCE_THRESHOLD) {
		unit.a = nearestEnemy;
	}
}


/**
*	An unit reacts when it is being attacked and has no order.
*/
AI.targetReaction = function (game, target, attacker) {
	if (gameData.ELEMENTS[target.f][target.r][target.t].isBuilder) {
		//flee if it is a builder
		var around = tools.getTilesAroundElements(game, target);
		if (around.length > 0) {
			target.mt = around[Math.random() * (around.length - 1)];	
		}
	} else {
		//attack back if it is a fighter
		target.a = attacker;
	}
}