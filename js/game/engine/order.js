var order = {};


/**
*	CONSTANTS
*/
order.TYPES = {
	action : 0,
	buildThatHere : 1, 
	buy : 2,
	cancelConstruction : 3
}


order.dispatchReceivedOrder = function (type, params) {
	switch (type) {
		case 0 :
			this.convertDestinationToOrder(params[0], params[1], params[2]);
			break;
		case 1 :
			this.buildThatHere(params[0], params[1], params[2], params[3]);
			break;
		case 2 :
			this.buy(params[0], params[1]);
			break;
		case 3 :
			this.cancelConstruction(params[0]);
			break;
	}
}


order.buildThatHere = function (buildersIds, building, x, y) {
	var builders = tools.getGameElementsFromIds(buildersIds);
	var building = new gameData.Building(building, x, y, builders[0].owner);
	production.startConstruction(building);
	this.build(builders, building);
}


order.buy = function (buildingsIds, element) {
	var buildings = tools.getGameElementsFromIds(buildingsIds);
	production.buyElement(buildings, element);
}


order.cancelConstruction = function (buildingId) {
	var building = tools.getGameElementsFromIds(buildingId);
	production.cancelConstruction(building);
}


order.updateRallyingPoint = function (buildings, x, y) {
	for (var i in buildings) {
		if(buildings[i].buttons.length > 0) {
			buildings[i].rallyingPoint = {x: x, y: y};
		}
	}
}


order.attack = function (elements, target) {
	for(var i in elements) {
		var element = elements[i];
		element.patrol = null;
		element.action = target;
	}
}


order.build = function (builders, building) {
	for(var i in builders) {
		var element = builders[i];
		element.patrol = null;
		element.action = building;
	}
}


order.move = function (units, x, y) {
	for(var i in units) {
		var element = units[i];
		element.patrol = null;
		element.action = null;
		element.moveTo = {x : x, y : y};
	}
}


order.gather = function (units, terrain) {
	for(var i in units) {
		var element = units[i];
		element.action = terrain;
		element.patrol = terrain;
	}
}


order.convertDestinationToOrder = function (elementsIds, x, y) {
	var elements = tools.getGameElementsFromIds(elementsIds);
	if (x >= gameLogic.grid[0].length
		|| y >= gameLogic.grid.length) {
		return;
	}

	if(elements[0].family == gameData.FAMILIES.building) {
		//buildings are selected
		this.updateRallyingPoint(elements, x, y);

	} else {
		//units are selected
		var element = tools.getElementUnder(x, y);
		if (element != null) {
			//something is under the click
			if (element.family == gameData.FAMILIES.unit) {
				if (!rank.isAlly(element)) {
					//enemy unit
					this.attack(elements, element);
					return;
				}
			} else if (element.family == gameData.FAMILIES.building) {
				if (rank.isAlly(element)) {
					//friend building
					for(var i in elements) {
						var e = elements[i];
						if(e.isBuilder) {
							//builders are sent to build / repair
							order.build([e], element);
						} else {
							//non-builders are given a move order
							order.move([e], x, y);
						}
					}
					return;
				} else {
					//enemy building
					order.attack(elements, element);
					return;
				}
			} else if (element.family == gameData.FAMILIES.terrain 
						&& element.resourceType >= 0) {
				//resource terrain element
				for(var i in elements) {
					var e = elements[i];
					if(e.isBuilder) {
						//builders are sent to gather resources
						order.gather([e], element);
						e.action = element;
					} else {
						//non-builders are given a move order
						order.move([e], x, y);
					}
				}
				return;
			}
		}

		//if no target = no action, just give a move order
		order.move(elements, x, y);

	}
	
}