/**
*	Starts a unit construction, or a research
*/
buildLogic.buyElement = function (element) {
	for(var i in gameLogic.selected) {
		var building = gameLogic.selected[i];
		if(building.type == gameLogic.selected[0].type
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
buildLogic.updateQueueProgress = function (building) {
	building.queueProgression += 100 / (gameThread.FPS * building.queue[0].timeConstruction);
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
buildLogic.createNewUnit = function (unit, factory) {
	var possiblePositions = tools.getTilesAroundElements(factory);
	var playerPopulation = gameManager.players[factory.owner].population;
	if(possiblePositions.length > 0 && playerPopulation.current + unit.population <= playerPopulation.max) {
		var position = possiblePositions[possiblePositions.length - 1];
		var unit = new gameData.Unit(unit, position.x, position.y, factory.owner);

		//updates population
		gameManager.players[factory.owner].population.current += unit.population;

		//moves the unit to the rallying point
		if(factory.rallyingPoint != null) {
			userInput.convertDestinationToOrder([unit], factory.rallyingPoint);
		}

		mapLogic.addGameElement(unit);
		return true;
	} else {
		return false;	
	}
}


/**
* 	A unit has just been killed / cancelled
*/
buildLogic.removeUnit = function (unit) {
	if(unit.population > 0) {
		gameManager.players[unit.owner].population.current -= unit.population;
	}
}


/**
*	Filters the list of things which can be bought depending 
*	on its needs (resources, researchs, etc...).
*/
buildLogic.getWhatCanBeBought = function (owner, elements) {
	var array = [];
	for(var key in elements) {
		var element = elements[key];
		element.isEnabled = this.canBuyIt(owner, element);
		array.push(element);
	}
	return array;
}


/**
*	Check if we can afford this element.
*/
buildLogic.canBuyIt = function (owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		if(need.value > gameManager.players[owner].resources[need.type]) {
			return false;
		}
	}
	return true;
}


/**
*	Pays for the element.
*/
buildLogic.paysForElement = function (owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		gameManager.players[owner].resources[need.type] -= need.value;
	}
}


/**
*	Sells the element.
*/
buildLogic.sellsElement = function (owner, element) {
	for(var i in element.needs) {
		var need = element.needs[i];
		gameManager.players[owner].resources[need.type] += parseInt(need.value / 2);
	}
}