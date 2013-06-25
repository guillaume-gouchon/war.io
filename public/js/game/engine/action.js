var action = {};


/**
*	CONSTANTS
*/
action.BUILD_ACTION_SPEED = 3;
action.ATTACK_SPEED_CONSTANT = 5;


/**
*	Basic build action.
*/
action.doTheBuild = function (game, element, building) {
	if(game.iterate % this.BUILD_ACTION_SPEED == 0) {
		if(building.cp < 100) {
			// building still in construction
			production.updateConstruction(game, building);
			element.fl = gameData.ELEMENTS_FLAGS.building;
		} else if (building.l < gameData.ELEMENTS[building.f][building.r][building.t].l) {
			// building damaged
			production.repairBuilding(game, building);
			element.fl = gameData.ELEMENTS_FLAGS.building;
		} else {
			// building construction is over
			element.a = null;
			element.fl = gameData.ELEMENTS_FLAGS.nothing;
		}

	}
}


/**
*	Basic attack action.
*/
action.doTheAttack = function (game, element, target) {
	if(game.iterate % (this.ATTACK_SPEED_CONSTANT - gameData.ELEMENTS[element.f][element.r][element.t].attackSpeed) == 0) {
		fightLogic.attack(game, element, target);
		element.fl = gameData.ELEMENTS_FLAGS.attacking;
	}
}


/**
*	Basic gathering action.
*/
action.doTheGathering = function (game, element, resource) {
	if(game.iterate % gameData.ELEMENTS[element.f][element.r][element.t].gatheringSpeed == 0) {
		production.gatherResources(game, element, resource);
		element.fl = gameData.ELEMENTS_FLAGS.mining;
	}
}
