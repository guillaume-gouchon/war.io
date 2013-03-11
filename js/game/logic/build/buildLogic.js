var buildLogic = {};


/**
*	CONSTANTS
*/
buildLogic.STATUS_CANNOT_BUILD_HERE = 1;
buildLogic.STATUS_CAN_BUILD_HERE = 10;


/**
*	The user has chosen where to build the structure.
*/
buildLogic.startConstruction = function (building) {
	if (this.canBuyIt(building.owner, building)) {
		this.paysForElement(building.owner, building);
		gameLogic.gameElements.push(building);
		userInput.leaveConstructionMode();
	}
}

/**
*	A builder has done a build action on this building, its progress is updated.
*/
buildLogic.updateConstruction = function (building) {
	building.constructionProgress += 100 / building.timeConstruction;
	building.color = building.constructionColors[parseInt((building.constructionColors.length - 1) * building.constructionProgress / 100)];
	if(building.constructionProgress >= 100) {
		this.finishConstruction(building);
	}
}


/**
*	A building has just been finised to construct.
*/
buildLogic.finishConstruction = function (building) {
	building.constructionProgress = 100;
	if(building.population > 0) {
		gameManager.players[building.owner].population.max += building.population;
	}
}


/**
*	A building has been destroyed / cancelled
*/
buildLogic.removeBuilding = function (building) {
	if(building.population > 0) {
		gameManager.players[building.owner].population.max -= building.population;
	}
}


/**
*	Returns the list of the buildings which can be built by the builder(s) selected.
*/
buildLogic.getBuildingButtons = function () {
	switch(gameLogic.selected[0].race) {
		
		case gameData.ARMIES.human :
			return this.getWhatCanBeBought(gameLogic.selected[0].owner, gameData.HUMAN_BUILDINGS);
		break;

		//...
	}
}


/**
*	A builder is gathering resources.
*/
buildLogic.gatherResources = function (builder, resource) {
	//reset resources if different from previous one
	if (builder.gathering == null || builder.gathering.type != resource.resourceType) {
		builder.gathering = {type : resource.resourceType, amount : 0};
	}

	var amount = Math.min(builder.maxGathering - builder.gathering.amount, 5, resource.resourceAmount);
	builder.gathering.amount += amount;
	resource.resourceAmount -= amount;

	if (builder.gathering.amount == builder.maxGathering) {
		//TODO : get closest town hall
		builder.action = gameLogic.gameElements[0];
	}
}


/**
*	A builder is coming back to a building with some resources
*/
buildLogic.getBackResources = function (builder) {
	gameManager.players[builder.owner].resources[builder.gathering.type] += builder.gathering.amount;
	builder.gathering = null;
	if(builder.patrol != null) {
		builder.action = builder.patrol;
	}
}