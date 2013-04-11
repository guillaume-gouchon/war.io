var action = {};


/**
*	CONSTANTS
*/
action.BUILD_ACTION_SPEED = 3;


/**
*	Basic build action.
*/
action.doTheBuild = function (element, building) {
	if(gameLoop.iterate % this.BUILD_ACTION_SPEED == 0) {
		if(building.cp < 100) {
			production.updateConstruction(building);	
		} else {
			element.a = null;
		}
	}
}


/**
*	Basic attack action.
*/
action.doTheAttack = function (element, target) {
	if(gameLoop.iterate % gameData.ELEMENTS[element.f][element.r][element.t].attackSpeed == 0) {
		fightLogic.attack(element, target);
	}
}


/**
*	Basic gathering action.
*/
action.doTheGathering = function (element, resource) {
	if(gameLoop.iterate % gameData.ELEMENTS[element.f][element.r][element.t].gatheringSpeed == 0) {
		production.gatherResources(element, resource);
	}
}

