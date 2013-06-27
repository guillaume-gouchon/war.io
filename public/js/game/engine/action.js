var action = {};


/**
*	CONSTANTS
*/

action.ACTION_TYPES = {
	move : 0,
	attack : 1,
	gather : 2,
	patrol : 3,
	build : 4
}
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

		} else if (building.l < tools.getElementData(building).l) {

			// building damaged = repair it
			production.repairBuilding(game, building);
			element.fl = gameData.ELEMENTS_FLAGS.building;

		} else {

			// building construction / repairing is over
			order.goToElementNextOrder(element);

		}

	}
}


/**
*	Basic attack action.
*/
action.doTheAttack = function (game, element, target) {
	if(game.iterate % (this.ATTACK_SPEED_CONSTANT - tools.getElementData(element).attackSpeed) == 0) {
		fightLogic.attack(game, element, target);
		element.fl = gameData.ELEMENTS_FLAGS.attacking;
	}
}


/**
*	Basic gathering action.
*/
action.doTheGathering = function (game, element, resource) {
	if(game.iterate % tools.getElementData(element).gatheringSpeed == 0) {
		production.gatherResources(game, element, resource);
		element.fl = gameData.ELEMENTS_FLAGS.mining;
	}
}
