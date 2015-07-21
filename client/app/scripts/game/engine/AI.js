var AI = {};


/**
*	Search for new resources to gather.
*/
AI.searchForNewResources = function (game, builder, resourceType) {

	var nearestResource = tools.getNearestStuff(game, builder, gameData.FAMILIES.land, resourceType);
	if (nearestResource == null && resourceType == gameData.RESOURCES.wood.id) {// builders can gather wood far from the town hall
		nearestResource = tools.getNearestStuff(game, builder, gameData.FAMILIES.land, resourceType, null, true);
	}
	if(nearestResource != null) {
		builder.a = new gameData.Order(action.ACTION_TYPES.gather, null, nearestResource.id, resourceType);
	} else {
		builder.a = null;
		builder.pa = [];
		builder.fl = gameData.ELEMENTS_FLAGS.nothing;
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
		unit.a = new gameData.Order(action.ACTION_TYPES.attack, null, nearestEnemy.id);
	}

}


/**
*	An unit reacts when it is being attacked and has no order.
*/
AI.targetReaction = function (game, target, attacker) {
	var elementData = tools.getElementData(target);
	if (elementData.isBuilder || (elementData.range > 1 && tools.getElementData(attacker).range == 1)) {

		// flee if it is a builder or a bowman attacked in close combat
		var around = tools.getFreeTilesAroundElements(game, target);
		if (around.length > 0) {
			var destination = around[parseInt(Math.random() * (around.length - 1))];
			target.a = new gameData.Order(action.ACTION_TYPES.move, destination, null);
		}

	} else {

		// attack back if it is a fighter
		target.a = new gameData.Order(action.ACTION_TYPES.attack, null, attacker.id);

	}
}
