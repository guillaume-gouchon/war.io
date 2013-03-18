/**
*	The user wants to build his construction at the current position.
*/
userInput.tryBuildHere = function () {
	if(gameContent.building.canBeBuiltHere) {
		//let's start the construction
		orderDispatcher.sendOrderToEngine(order.TYPES.buildThatHere,
							 [this.getSelectedElementsIds(), gameContent.building, 
							  gameContent.building.position.x, 
							  gameContent.building.position.y]);
	} else {
		//cannot be built here !
	}
}


/**
*	Dispatches the action according to the order
*/
userInput.dispatchUnitAction = function (x, y) {
	var destination = gameWindow.getAbsolutePositionFromPixel(x, y);
	orderDispatcher.sendOrderToEngine(order.TYPES.action,
							 [this.getSelectedElementsIds(),
							  destination.x, 
							  destination.y]);
}


/**
*	Returns ids of the selected elements.
*/
userInput.getSelectedElementsIds = function () {
	var selectedIds = [];
	for (var i in gameContent.selected) {
		selectedIds.push(gameContent.selected[i].id);
	}
	return selectedIds;
}