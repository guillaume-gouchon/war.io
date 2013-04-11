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
	var building = new gameData.Building(building, x, y, builders[0].o, false);
	production.startConstruction(building);
	//give order to builders
	this.build(builders, building);
}


order.buy = function (buildingsIds, element) {
	var buildings = tools.getGameElementsFromIds(buildingsIds);
	production.buyElement(buildings, element);
}


order.cancelConstruction = function (buildingId) {
	var building = tools.getGameElementsFromIds([buildingId]);
	production.cancelConstruction(building[0]);
}


order.updateRallyingPoint = function (buildings, x, y) {
	for (var i in buildings) {
		var building = buildings[i];
		var buttons = gameData.ELEMENTS[building.f][building.r][building.t].buttons;
		if(buttons.length > 0) {
			building.rp = {x: x, y: y};
		}
		tools.addUniqueElementToArray(gameLogic.modified, building);
	}
}


order.attack = function (elements, target) {
	for(var i in elements) {
		var element = elements[i];
		element.pa = null;
		element.a = target;
		tools.addUniqueElementToArray(gameLogic.modified, element);
	}
}


order.build = function (builders, building) {
	for(var i in builders) {
		var element = builders[i];
		element.pa = null;
		element.a = building;
		tools.addUniqueElementToArray(gameLogic.modified, element);
	}
}


order.move = function (units, x, y) {
	for(var i in units) {
		var element = units[i];
		element.pa = null;
		element.a = null;
		element.mt = {x : x, y : y};
		tools.addUniqueElementToArray(gameLogic.modified, element);
	}
}


order.gather = function (units, terrain) {
	for(var i in units) {
		var element = units[i];
		element.a = terrain;
		element.pa = terrain;
		tools.addUniqueElementToArray(gameLogic.modified, element);
	}
}


/**
*	Dispatches the user action to the correct order.
*/
order.convertDestinationToOrder = function (elementsIds, x, y) {
	var elements = tools.getGameElementsFromIds(elementsIds);
	if (elements.length == 0 || x >= gameLogic.grid[0].length
		|| y >= gameLogic.grid.length) {
		return;
	}

	if(elements[0].f == gameData.FAMILIES.building) {
		//buildings are selected
		this.updateRallyingPoint(elements, x, y);
	} else {
		//units are selected
		var element = tools.getElementUnder(x, y);
		if (element != null) {
			//something is under the click
			if (element.f == gameData.FAMILIES.unit) {
				if (!rank.isAlly(elements[0].o, element)) {
					//enemy unit
					this.attack(elements, element);
					return;
				}
			} else if (element.f == gameData.FAMILIES.building) {
				if (rank.isAlly(elements[0].o, element)) {
					//friend building
					for(var i in elements) {
						var e = elements[i];
						if(gameData.ELEMENTS[e.f][e.r][e.t].isBuilder) {
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
			} else if (element.f == gameData.FAMILIES.terrain 
						&& gameData.ELEMENTS[element.f][0][element.t].resourceType >= 0) {
				//resource terrain element
				for(var i in elements) {
					var e = elements[i];
					if(gameData.ELEMENTS[e.f][e.r][e.t].isBuilder) {
						//builders are sent to gather resources
						order.gather([e], element);
						e.a = element;
					} else {
						//non-builders are given a move order
						order.move([e], x, y);
					}
				}
				return;
			}
		}

		//if no target, just give a move order
		order.move(elements, x, y);
	}
	
}
