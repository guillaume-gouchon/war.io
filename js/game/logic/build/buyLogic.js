/**
*	Starts a unit construction, or a research
*/
buildLogic.buyElement = function (element) {
	for(var i in gameLogic.selected) {
		var building = gameLogic.selected[i];
		if(building.type == gameLogic.selected[0].type
			&& building.constructionProgress == 100
			&& building.queue.length < 5) {
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
		//element is ready
		building.queueProgression = 0;
		if(building.queue[0].speed != null) {
			//unit
			this.createNewUnit(building.queue[0], building);	
		}
		
		//update queue
		building.queue.splice(0, 1);
	}
}


/**
*	The unit just pops up from the factory.
*/
buildLogic.createNewUnit = function (unit, factory) {
	var possiblePositions = tools.getTilesAroundElements(factory);
	if(possiblePositions.length > 0) {
		var position = possiblePositions[possiblePositions.length - 1];
		var unit = new gameData.Unit(unit, position.x, position.y, factory.army);
		
		//moves the unit to the rallying point
		if(factory.rallyingPoint != null) {
			unit.moveTo = factory.rallyingPoint;
		}

		gameLogic.gameElements.push(unit);
	}
}


