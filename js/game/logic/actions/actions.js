

/**
*	Basic build action.
*/
actions.doTheBuild = function (element, building) {
	if(building.constructionProgress < 100) {
		buildLogic.updateConstruction(building);	
	} else {
		element.action = null;
	}
	
}


/**
*	Basic attack action.
*/
actions.doTheAttack = function (element, target) {
	if(gameManager.iterate % element.attackSpeed == 0) {
		fightLogic.attack(element, target);
	}
}


/**
*	Basic gathering action.
*/
actions.doTheGathering = function (element, resource) {
	if(gameManager.iterate % element.gatheringSpeed == 0) {
		buildLogic.gatherResources(element, resource);
	}
}