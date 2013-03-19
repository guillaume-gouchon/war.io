var action = {};


/**
*	Basic build action.
*/
action.doTheBuild = function (element, building) {
	if(building.constructionProgress < 100) {
		production.updateConstruction(building);	
	} else {
		element.action = null;
	}
	
}


/**
*	Basic attack action.
*/
action.doTheAttack = function (element, target) {
	if(gameLoop.iterate % element.attackSpeed == 0) {
		fightLogic.attack(element, target);
	}
}


/**
*	Basic gathering action.
*/
action.doTheGathering = function (element, resource) {
	if(gameLoop.iterate % element.gatheringSpeed == 0) {
		production.gatherResources(element, resource);
	}
}