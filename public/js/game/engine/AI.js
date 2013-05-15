var AI = {};


/**
*	Search for new resources to gather.
*/
AI.searchForNewResources = function (game, builder, fromWhere, resourceType) {
	var nearestResource = mapLogic.getNearestResource(game, fromWhere, resourceType);
	if(tools.getElementsDistance(fromWhere, nearestResource) <= gameData.ELEMENTS[builder.f][builder.r][builder.t].vision) {
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
	if(nearestEnemy != null) {
		unit.a = nearestEnemy;
	}
}


/**
*	An unit reacts when it is being attacked and has no order.
*/
AI.targetReaction = function (game, target, attacker) {
	if (gameData.ELEMENTS[target.f][target.r][target.t].isBuilder
		|| (gameData.ELEMENTS[target.f][target.r][target.t].range > 1 && gameData.ELEMENTS[attacker.f][attacker.r][attacker.t].range == 1)) {
		//flee if it is a builder or a bowman attacked in close combat
		var around = tools.getTilesAroundElements(game, target);
		if (around.length > 0) {
			target.mt = around[parseInt(Math.random() * (around.length - 1))];	
		}
	} else {
		//attack back if it is a fighter
		target.a = attacker;
	}
}
