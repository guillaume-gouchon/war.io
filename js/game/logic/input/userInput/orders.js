/**
*	The user wants to build his construction at the current position.
*/
userInput.tryBuildHere = function () {
	if(gameLogic.building.canBeBuiltHere) {//let's start the construction
		actions.buildThatHere(gameLogic.selected, gameLogic.building, 
							  gameLogic.building.position.x, 
							  gameLogic.building.position.y,
							  gameLogic.selected[0].army);
	} else {//cannot be built here !
	}
}


/**
*	The user changes the rallying point of the buildings selected.
* @param (x, y) : coordinates of the new rallying point 
*/
userInput.changeRallyingPoint = function (x, y) {
	var destination = gameSurface.getAbsolutePositionFromPixel(x, y);
	for(var i in gameLogic.selected) {
		gameLogic.selected[i].rallyingPoint = {x: destination.x, y: destination.y};
	}
}


/**
*	Dispatches the action according to the order
*/
userInput.dispatchUnitAction = function (x, y) {
	var destination = gameSurface.getAbsolutePositionFromPixel(x, y);
	if (destination.x >= gameLogic.grid[0].length
		|| destination.y >= gameLogic.grid.length) {
		return;
	}
	for (var i in gameLogic.gameElements) {
		var element = gameLogic.gameElements[i];
		if (tools.isElementThere(element, destination)) {
			//something is under the click
			if (element.family == gameData.FAMILIES.unit) {
				if (!fightLogic.isAlly(element)) {
					//enemy unit
					actions.attack(gameLogic.selected, element);
					return;
				}
			} else if (element.family == gameData.FAMILIES.building) {
				if (fightLogic.isAlly(element)) {
					//friend building
					for(var i in gameLogic.selected) {
						var selectedUnit = gameLogic.selected[i];
						if(selectedUnit.isBuilder) {
							//builders are sent to build / repair
							actions.build([selectedUnit], element);
						} else {
							//non-builders are given a move order
							actions.move([selectedUnit], destination.x, destination.y);
						}
					}
					return;
				} else {
					//enemy building
					actions.attack(gameLogic.selected, element);
					return;
				}
			} else if (element.family == gameData.FAMILIES.terrain 
						&& element.resourceType >= 0) {
				//resource terrain element
				for(var i in gameLogic.selected) {
					var selectedUnit = gameLogic.selected[i];
					if(selectedUnit.isBuilder) {
						//builders are sent to gather resources
						actions.gather([selectedUnit], element);
						selectedUnit.action = element;
					} else {
						//non-builders are given a move order
						actions.move([selectedUnit], destination.x, destination.y);
					}
				}
				return;
			}
		}
	}

	//if no target = no action, just a move order
	actions.move(gameLogic.selected, destination.x, destination.y);
}

