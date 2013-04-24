var action = {};


/**
*	CONSTANTS
*/
action.BUILD_ACTION_SPEED = 3;


/**
*	Basic build action.
*/
action.doTheBuild = function (game, element, building) {
	if(game.iterate % this.BUILD_ACTION_SPEED == 0) {
		if(building.cp < 100) {
			production.updateConstruction(game, building);	
		} else {
			element.a = null;
		}
	}
}


/**
*	Basic attack action.
*/
action.doTheAttack = function (game, element, target) {
	if(game.iterate % (3 - gameData.ELEMENTS[element.f][element.r][element.t].attackSpeed) == 0) {
		fightLogic.attack(game, element, target);
	}
}


/**
*	Basic gathering action.
*/
action.doTheGathering = function (game, element, resource) {
	if(game.iterate % gameData.ELEMENTS[element.f][element.r][element.t].gatheringSpeed == 0) {
		production.gatherResources(game, element, resource);
	}
}

