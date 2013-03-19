var production = {};


/**
*	The user has chosen where to build the structure.
*/
production.startConstruction = function (building) {
	if (this.canBuyIt(building.owner, building)) {
		this.paysForElement(building.owner, building);
		mapLogic.addGameElement(building);
	}
}


/**
*	A builder has done a build action on this building, its progress is updated.
*/
production.updateConstruction = function (building) {
	building.constructionProgress += 100 / gameData.ELEMENTS[building.family][building.race][building.type].timeConstruction;
	building.color = gameData.ELEMENTS[building.family][building.race][building.type].constructionColors[parseInt((gameData.ELEMENTS[building.family][building.race][building.type].constructionColors.length - 1) * building.constructionProgress / 100)];
	if(building.constructionProgress >= 100) {
		this.finishConstruction(building);
	}
}


/**
*	The user cancels the construction of a building.
*/
production.cancelConstruction = function (building) {
	if (building.constructionProgress < 100) {
		building.life = 0;
		this.sellsElement(building.owner, building);
	}
}


/**
*	A building has just been finished to construct.
*/
production.finishConstruction = function (building) {
	building.constructionProgress = 100;
	if(gameData.ELEMENTS[building.family][building.race][building.type].population > 0) {
		gameLogic.players[building.owner].population.max += gameData.ELEMENTS[building.family][building.race][building.type].population;
	}
}


/**
*	A building has been destroyed / cancelled
*/
production.removeBuilding = function (building) {
	if(gameData.ELEMENTS[building.family][building.race][building.type].population > 0 && building.constructionProgress == 100) {
		gameLogic.players[building.owner].population.max -= gameData.ELEMENTS[building.family][building.race][building.type].population;
	}
}


/**
*	A builder is gathering resources.
*/
production.gatherResources = function (builder, resource) {

	//reset resources if different from previous one
	if (builder.gathering == null || builder.gathering.type != gameData.ELEMENTS[resource.family][resource.race][resource.type].resourceType) {
		builder.gathering = {type : gameData.ELEMENTS[resource.family][resource.race][resource.type].resourceType, amount : 0};
	}

	var amount = Math.min(gameData.ELEMENTS[builder.family][builder.race][builder.type].maxGathering - builder.gathering.amount, 5, resource.resourceAmount);
	builder.gathering.amount += amount;
	resource.resourceAmount -= amount;

	if (builder.gathering.amount == gameData.ELEMENTS[builder.family][builder.race][builder.type].maxGathering) {
		var closestTownHall = mapLogic.getNearestBuilding(builder, gameData.ELEMENTS[gameData.FAMILIES.building][gameLogic.players[builder.owner].race][0].type);
		builder.action = closestTownHall;
	} else if (resource.resourceAmount == 0) {
		AI.searchForNewResources(builder, builder, gameData.ELEMENTS[builder.patrol.family][builder.patrol.race][builder.patrol.type].resourceType);
	}
}


/**
*	A builder is coming back to a building with some resources
*/
production.getBackResources = function (builder) {
	gameLogic.players[builder.owner].resources[builder.gathering.type] += builder.gathering.amount;
	builder.gathering = null;
	if(builder.patrol != null) {
		if(builder.patrol.resourceAmount == 0) {
			//gather closest resource if this one is finished
			AI.searchForNewResources(builder, builder.patrol, gameData.ELEMENTS[builder.patrol.family][builder.patrol.race][builder.patrol.type].resourceType);
		} else {
			builder.action = builder.patrol;
		}
	}
}


/**
*	Starts a unit construction, or a research
*/
production.buyElement = function (buildings, element) {
	for(var i in buildings) {
		var building = buildings[i];
		if(building.type == buildings[0].type
			&& building.constructionProgress == 100
			&& building.queue.length < 5
			&& this.canBuyIt(building.owner, element)) {
				this.paysForElement(building.owner, element);
				building.queue.push(element);
		}
	}

}


/**
*	Update the queue and the progression of what the building is creating.
*/
production.updateQueueProgress = function (building) {
	building.queueProgression += 100 / (gameLoop.FREQUENCY * building.queue[0].timeConstruction);
	if(building.queueProgression >= 100) {
		var canGoToNext = true;
		if(building.queue[0].speed > 0) {
			//unit
			canGoToNext = this.createNewUnit(building.queue[0], building);	
		}


		if (canGoToNext) {
			//element is ready
			building.queueProgression = 0;
			
			//update queue
			building.queue.splice(0, 1);
		} else {
			building.queueProgression = 100;
		}
		
	}
}


/**
*	The unit just pops up from the factory if there is place and population is not exceeding.
*/
production.createNewUnit = function (unit, factory) {
	var possiblePositions = tools.getTilesAroundElements(factory);
	var playerPopulation = gameLogic.players[factory.owner].population;
	if(possiblePositions.length > 0 && playerPopulation.current + unit.population <= playerPopulation.max) {
		var position = possiblePositions[possiblePositions.length - 1];
		var unit = new gameData.Unit(unit, position.x, position.y, factory.owner);

		//updates population
		gameLogic.players[factory.owner].population.current += gameData.ELEMENTS[unit.family][unit.race][unit.type].population;


		mapLogic.addGameElement(unit);

		//moves the unit to the rallying point
		if(factory.rallyingPoint != null) {
			order.convertDestinationToOrder([unit.id], factory.rallyingPoint.x, factory.rallyingPoint.y);
		}

		return true;
	} else {
		return false;	
	}
}


/**
* 	A unit has just been killed / cancelled
*/
production.removeUnit = function (unit) {
	if(gameData.ELEMENTS[unit.family][unit.race][unit.type].population > 0) {
		gameLogic.players[unit.owner].population.current -= gameData.ELEMENTS[unit.family][unit.race][unit.type].population;
	}
}


/**
*	Check if we can afford this element.
*/
production.canBuyIt = function (owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		if(need.value > gameLogic.players[owner].resources[need.type]) {
			return false;
		}
	}
	return true;
}


/**
*	Pays for the element.
*/
production.paysForElement = function (owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		gameLogic.players[owner].resources[need.type] -= need.value;
	}
}


/**
*	Sells the element.
*/
production.sellsElement = function (owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		gameLogic.players[owner].resources[need.type] += parseInt(need.value / 2);
	}
}


/**
*	Filters the list of things which can be bought depending 
*	on its needs (resources, researchs, etc...).
*/
production.getWhatCanBeBought = function (owner, elements) {
	var array = [];
	for(var key in elements) {
		var element = elements[key];
		element.isEnabled = this.canBuyIt(owner, element);
		array.push(element);
	}
	return array;
}