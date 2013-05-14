var production = {};


/**
*	CONSTANTS
*/
production.RESOURCE_AMOUNT_PER_GATHERING_ACTION = 2;
production.BUILDINGS_QUEUE_MAX_SIZE = 5;
production.REPAIRING_SPEED = 5;


/**
*	The user has chosen where to build this structure.
*/
production.startConstruction = function (game, building) {
	var buildingData = gameData.ELEMENTS[building.f][building.r][building.t];
	if (this.canBuyIt(game.players, building.o, buildingData)) {
		this.paysForElement(game, building.o, buildingData);
		game.newBuildings.push(building);
	}
}


/**
*	A builder has done a build action on this building, its progress is updated.
*/
production.updateConstruction = function (game, building) {
	building.cp += 100 / gameData.ELEMENTS[building.f][building.r][building.t].timeConstruction;
	building.l += parseInt(gameData.ELEMENTS[building.f][building.r][building.t].l / gameData.ELEMENTS[building.f][building.r][building.t].timeConstruction);
	building.l = Math.min(gameData.ELEMENTS[building.f][building.r][building.t].l, building.l);
	if(building.cp >= 100) {
		this.finishConstruction(game, building);
	}
	tools.addUniqueElementToArray(game.modified, building);
}


/**
*	The user cancels the construction of a building.
*/
production.cancelConstruction = function (game, building) {
	if (building != null && building.cp < 95) {
		this.sellsElement(game, building.o, gameData.ELEMENTS[building.f][building.r][building.t]);
		production.removeBuilding(game, building);
		for (var i in game.gameElements[gameData.FAMILIES.building]) {
			if (game.gameElements[gameData.FAMILIES.building][i].id == building.id) {
				gameCreation.removeGameElement(game, building);
				game.gameElements[gameData.FAMILIES.building].splice(i, 1);
				break;
			}
		}
	}
}


/**
*	A building has just been finished to construct.
*/
production.finishConstruction = function (game, building) {
	building.cp = 100;
	building.l = gameData.ELEMENTS[building.f][building.r][building.t].l;

	//udpates player's max population
	if(gameData.ELEMENTS[building.f][building.r][building.t].pop > 0) {
		game.players[building.o].pop.max += gameData.ELEMENTS[building.f][building.r][building.t].pop;
	}

	stats.updateField(game, building.o, 'buildingsCreated', 1);
}


/**
*	A builder is repairing the building.
*/
production.repairBuilding = function (game, building) {
	var playerResources = game.players[building.o].re;
	if (playerResources[gameData.RESOURCES.wood.id] > 0
		&& playerResources[gameData.RESOURCES.gold.id] > 0) {
		playerResources[gameData.RESOURCES.gold.id]--;
		playerResources[gameData.RESOURCES.wood.id]--;
		building.l += this.REPAIRING_SPEED;
		building.l = Math.min(building.l, gameData.ELEMENTS[building.f][building.r][building.t].l);
		tools.addUniqueElementToArray(game.modified, building);
	}
}


/**
*	A building has been destroyed / cancelled
*/
production.removeBuilding = function (game, building) {
	if(gameData.ELEMENTS[building.f][building.r][building.t].pop > 0 && building.cp == 100) {
		game.players[building.o].pop.max -= gameData.ELEMENTS[building.f][building.r][building.t].pop;
	}

	if (building.murderer != null) {
		stats.updateField(game, building.murderer, 'buildingsDestroyed', 1);
	}
}


/**
*	A builder is gathering resources.
*/
production.gatherResources = function (game, builder, resource) {
	//reset resources if different from previous one
	if (builder.ga == null || builder.ga.t != gameData.ELEMENTS[resource.f][resource.r][resource.t].resourceType) {
		builder.ga = {t : gameData.ELEMENTS[resource.f][resource.r][resource.t].resourceType, amount : 0};
	}

	var amount = Math.min(gameData.ELEMENTS[builder.f][builder.r][builder.t].maxGathering - builder.ga.amount, this.RESOURCE_AMOUNT_PER_GATHERING_ACTION, resource.ra);
	builder.ga.amount += amount;
	resource.ra -= amount;

	tools.addUniqueElementToArray(game.modified, resource);

	if (builder.ga.amount == gameData.ELEMENTS[builder.f][builder.r][builder.t].maxGathering) {
		//the builder is full of resources, get back resources
		var closestTownHall = mapLogic.getNearestBuilding(game, builder, gameData.ELEMENTS[gameData.FAMILIES.building][game.players[builder.o].r][0].t);
		builder.a = closestTownHall;
	} else if (resource.ra == 0) {
		//the resource is now empty, searching a new resource of the same type
		AI.searchForNewResources(game, builder, builder, gameData.ELEMENTS[builder.pa.f][builder.pa.r][builder.pa.t].resourceType);

		//remove resource
		for (var i in game.gameElements[gameData.FAMILIES.land]) {
			if (game.gameElements[gameData.FAMILIES.land][i].id == resource.id) {
				gameCreation.removeGameElement(game, resource);
				game.gameElements[gameData.FAMILIES.land].splice(i, 1);
				break;
			}
		}
	}
}


/**
*	A builder is coming back to a building with some resources.
*/
production.getBackResources = function (game, builder) {
	game.players[builder.o].re[builder.ga.t] += builder.ga.amount;
	stats.updateField(game, builder.o, 'resources', builder.ga.amount);
	builder.ga = null;
	if(builder.pa != null) {
		if(builder.pa.ra == 0) {
			//gather closest resource if this one is finished
			AI.searchForNewResources(game, builder, builder.pa, gameData.ELEMENTS[builder.pa.f][builder.pa.r][builder.pa.t].resourceType);
		} else {
			builder.a = builder.pa;
		}
	}
}


/**
*	Starts a unit construction, or a research.
*/
production.buyElement = function (game, buildings, elementData) {
	for(var i in buildings) {
		var building = buildings[i];
		if(building.t == buildings[0].t
			&& building.cp == 100
			&& building.q.length < this.BUILDINGS_QUEUE_MAX_SIZE
			&& this.canBuyIt(game.players, building.o, elementData)) {
				this.paysForElement(game, building.o, elementData);
				building.q.push(elementData.t);
				tools.addUniqueElementToArray(game.modified, building);
		}
	}

}


/**
*	Update the queue and the progression of what the building is creating.
*/
production.updateQueueProgress = function (game, building) {
	building.qp += 100 / (gameLogic.FREQUENCY * gameData.ELEMENTS[gameData.FAMILIES.unit][building.r][building.q[0]].timeConstruction);
	if(building.qp >= 100) {
		var canGoToNext = true;
		//if(building.q[0].f == gameData.FAMILIES.unit) {
			//check if the unit can be released
			canGoToNext = this.createNewUnit(game, building.q[0], building);	
		//}

		if (canGoToNext) {
			//element is ready, go to next one
			building.qp = 0;
			building.q.splice(0, 1);
		} else {
			//element cannot be released, wait until it can
			building.qp = 99;
		}
		
	}
	tools.addUniqueElementToArray(game.modified, building);
}


/**
*	The unit just pops up from the factory if there is place and population is not exceeding.
*/
production.createNewUnit = function (game, unitType, factory) {
	var unit = gameData.ELEMENTS[gameData.FAMILIES.unit][factory.r][unitType];
	var possiblePositions = tools.getTilesAroundElements(game, factory);
	var playerPopulation = game.players[factory.o].pop;
	if(possiblePositions.length > 0 && playerPopulation.current + unit.pop <= playerPopulation.max) {
		
		if (unit.isBuilder) {
			stats.updateField(game, factory.o, 'buildersCreated', 1);
		} else {
			stats.updateField(game, factory.o, 'unitsCreated', 1);
		}

		var position = possiblePositions[possiblePositions.length - 1];
		unit = new gameData.Unit(unit, position.x, position.y, factory.o);

		//updates population
		game.players[factory.o].pop.current += gameData.ELEMENTS[unit.f][unit.r][unit.t].pop;

		gameCreation.addGameElement(game, unit);

		//moves the unit to the rallying point
		if(factory.rp != null) {
			order.convertDestinationToOrder(game, [unit.id], factory.rp.x, factory.rp.y);
		}

		return true;
	}

	return false;
}


/**
* 	A unit has just been killed / cancelled
*/
production.removeUnit = function (game, unit) {
	if(gameData.ELEMENTS[unit.f][unit.r][unit.t].pop > 0) {
		game.players[unit.o].pop.current -= gameData.ELEMENTS[unit.f][unit.r][unit.t].pop;
	}

	if (unit.murderer != null) {
		stats.updateField(game, unit.murderer, 'killed', 1);
		stats.updateField(game, unit.o, 'lost', 1);
	}
}


/**
*	Check if we can afford this element.
*/
production.canBuyIt = function (players, owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		if(need.value > players[owner].re[need.t]) {
			return false;
		}
	}
	return true;
}


/**
*	Pays for the element.
*/
production.paysForElement = function (game, owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		game.players[owner].re[need.t] -= need.value;
	}
}


/**
*	Sells the element.
*/
production.sellsElement = function (game, owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		game.players[owner].re[need.t] += parseInt(need.value / 2);
	}
}


/**
*	Filters the list of things which can be bought depending 
*	on its needs (resources, researchs, etc...).
*/
production.getWhatCanBeBought = function (players, owner, elements) {
	var array = [];
	for(var key in elements) {
		var element = elements[key];
		element.isEnabled = this.canBuyIt(players, owner, element);
		array.push(element);
	}
	return array;
}