var AI = {};


/**
*	Search for new resources to gather.
*/
AI.searchForNewResources = function (game, builder, resourceType) {
	var nearestResource = tools.getNearestStuff(game, builder, gameData.FAMILIES.land, resourceType);
	if(nearestResource != null) {
		builder.a = nearestResource;
		builder.pa = [nearestResource];
	} else {
		builder.a = null;
		builder.pa = [];
	}
}


/**
*	Search for new enemy to attack.
*/
AI.searchForNewEnemy = function (game, unit) {
	// units have the priority
	var nearestEnemy = tools.getNearestStuff(game, unit, gameData.FAMILIES.unit, null, gameData.RANKS.enemy);
	if (nearestEnemy == null) {
		nearestEnemy = tools.getNearestStuff(game, unit, gameData.FAMILIES.building, null, gameData.RANKS.enemy);
	}
	if(nearestEnemy != null) {
		unit.a = nearestEnemy;
	} else {
		unit.a = null;
	}
}


/**
*	An unit reacts when it is being attacked and has no order.
*/
AI.targetReaction = function (game, target, attacker) {
	if (gameData.ELEMENTS[target.f][target.r][target.t].isBuilder
		|| (gameData.ELEMENTS[target.f][target.r][target.t].range > 1 && gameData.ELEMENTS[attacker.f][attacker.r][attacker.t].range == 1)) {
		//flee if it is a builder or a bowman attacked in close combat
		var around = tools.getFreeTilesAroundElements(game, target);
		if (around.length > 0) {
			target.mt = around[parseInt(Math.random() * (around.length - 1))];	
		}
	} else {
		//attack back if it is a fighter
		target.a = attacker;
	}
}
