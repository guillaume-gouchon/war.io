var order = {};


/**
*	CONSTANTS
*/
order.TYPES = {
	action : 0,
	buildThatHere : 1, 
	buy : 2,
	cancelConstruction : 3,
	chat : 4,
	diplomacy : 5,
	surrender : 6,
	stop : 7,
	hold : 8
}

order.SPECIAL_ORDERS = {
	normal : 0,
	attack : 1,
	patrol : 2
}


order.dispatchReceivedOrder = function (game, type, params) {
	switch (type) {
		case 0 :
			this.convertDestinationToOrder(game, params[0], params[1], params[2], params[3], params[4]);
			break;
		case 1 :
			this.buildThatHere(game, params[0], params[1], params[2], params[3], params[4]);
			break;
		case 2 :
			this.buy(game, params[0], params[1]);
			break;
		case 3 :
			this.cancelConstruction(game, params[0]);
			break;
		case 4 :
			this.receiveChatMessage(game, params[0], params[1]);
			break;
		case 5 :	
			this.updateDiplomacy(game, params[0], params[1], params[2]);
			break;
		case 6 :
			this.surrender(game, params[0]);
			break;
		case 7 :
			this.stopUnits(game, params[0]);
			break;
		case 8 :
			this.holdUnits(game, params[0]);
			break;
	}
}


order.buildThatHere = function (game, buildersIds, building, x, y, isMultipleOrder) {

	var builders = tools.getGameElementsFromIds(game, buildersIds);
	var building = new gameData.Building(building, x, y, builders[0].o, false);
	production.startConstruction(game, building);

	//give order to builders
	this.build(game, builders, building, isMultipleOrder);

}


order.buy = function (game, buildingsIds, element) {
	var buildings = tools.getGameElementsFromIds(game, buildingsIds);
	production.buyElement(game, buildings, element);
}


order.cancelConstruction = function (game, buildingId) {
	var building = tools.getGameElementsFromIds(game, [buildingId]);
	production.cancelConstruction(game, building[0]);
}


order.updateRallyingPoint = function (game, buildings, x, y) {
	for (var i in buildings) {
		var building = buildings[i];
		var buildingData = tools.getElementData(building);
		var buttons = buildingData.buttons;
		if(buttons.length > 0) {
			building.rp = {x: x, y: y};
		}
		tools.addUniqueElementToArray(game.modified, building);
	}
}


order.attack = function (game, elements, target) {
	for(var i in elements) {
		var element = elements[i];
		element.a = new gameData.Order(action.ACTION_TYPES.attack, null, target.id);
		element.pa = [];
		tools.addUniqueElementToArray(game.modified, element);
	}
}


order.build = function (game, builders, building, isMultipleOrder) {
	for(var i in builders) {
		var element = builders[i];
		if (isMultipleOrder && element.a != null && element.a.type != action.ACTION_TYPES.gather) {
			element.pa.push(new gameData.Order(action.ACTION_TYPES.build, null, building.id));
		} else {
			element.a = new gameData.Order(action.ACTION_TYPES.build, null, building.id);
			element.pa = [];
		}
		tools.addUniqueElementToArray(game.modified, element);
	}
}


order.move = function (game, units, x, y, isMultipleOrder, specialOrder) {
	for(var i in units) {
		var element = units[i];

		if (isMultipleOrder && element.a != null && element.a.type != action.ACTION_TYPES.gather) {
			element.pa.push(new gameData.Order(action.ACTION_TYPES.move, {x: x, y: y}, null, specialOrder));
		} else {
			element.a = new gameData.Order(action.ACTION_TYPES.move, {x: x, y: y}, null, specialOrder);
			element.pa = [];
			if (specialOrder == order.SPECIAL_ORDERS.patrol) {// patrol
				element.pa.push(new gameData.Order(action.ACTION_TYPES.move, {x: element.p.x, y: element.p.y}, null, 2));
			}
		}
		tools.addUniqueElementToArray(game.modified, element);
	}
}


order.gather = function (game, units, land, isMultipleOrder) {
	var landData = tools.getElementData(land);
	for(var i in units) {
		var element = units[i];
		if (isMultipleOrder && element.a != null && element.a.type != action.ACTION_TYPES.gather) {
			element.pa.push(new gameData.Order(action.ACTION_TYPES.gather, null, land.id, landData.resourceType));
		} else {
			element.a = new gameData.Order(action.ACTION_TYPES.gather, null, land.id, landData.resourceType);
			element.pa = [element.a];
		}
		tools.addUniqueElementToArray(game.modified, element);
	}
}


order.receiveChatMessage = function (game, player, message) {
	game.chat.push({ o: player, text: message });
}


order.updateDiplomacy = function (game, fromPlayer, toPlayer, newRank) {
	game.players[fromPlayer].ra[toPlayer] = newRank;
}


order.surrender = function (game, army) {
	game.players[army].s = gameData.PLAYER_STATUSES.surrender;
}


/**
*	Dispatches the user action to the correct order.
*/
order.convertDestinationToOrder = function (game, elementsIds, x, y, isMultipleOrder, specialOrder) {
	var elements = tools.getGameElementsFromIds(game, elementsIds);
	if (elements.length == 0 || game.grid[x] == null || game.grid[x][y] == null) { 	console.log(x + ' ' + y);
return; }

	var target = null;
	var targetId = game.grid[x][y].c;
	if (targetId > 0) {
		target = tools.getGameElementsFromIds(game, [targetId]);
	}

	if(elements[0].f == gameData.FAMILIES.building) {
		// buildings are selected
		this.updateRallyingPoint(game, elements, x, y);
	} else {
		// units are selected
		if (target != null && target.length > 0) {
			var targetData = tools.getElementData(target[0]);

			// something is under the click
			if (target[0].f == gameData.FAMILIES.unit) {
				if (!rank.isAlly(game.players, elements[0].o, target[0])) {
					// enemy unit
					this.attack(game, elements, target[0]);
					return;
				}
			} else if (target[0].f == gameData.FAMILIES.building) {
				if (rank.isAlly(game.players, elements[0].o, target[0])) {
					// friend building
					for(var i in elements) {
						var e = elements[i];
						if(tools.getElementData(e).isBuilder) {
							// builders are sent to build / repair
							order.build(game, [e], target[0], isMultipleOrder);
						} else {
							// non-builders are given a move order
							order.move(game, [e], x, y, isMultipleOrder, specialOrder);
						}
					}
					return;
				} else {
					// enemy building
					order.attack(game, elements, target[0]);
					return;
				}
			} else if (target[0].f == gameData.FAMILIES.land 
						&& targetData.resourceType >= 0) {
				// resource land element
				for(var i in elements) {
					var e = elements[i];
					if(tools.getElementData(e).isBuilder) {
						// builders are sent to gather resources
						order.gather(game, [e], target[0], isMultipleOrder);
					} else {
						// non-builders are given a move order
						order.move(game, [e], x, y, isMultipleOrder, specialOrder);
					}
				}
				return;
			}
		}

		// if no target, just give a move order
		order.move(game, elements, x, y, isMultipleOrder, specialOrder);
	}
	
}


order.goToElementNextOrder = function (game, element) {

	if (element.pa.length > 0) {

		if (element.a != null && element.a.type == action.ACTION_TYPES.gather) {
			return;
		} else if (element.a != null && element.a.type == action.ACTION_TYPES.build) {
			var target = tools.getElementById(game, element.a.id);
			var targetData = tools.getElementData(target);
			if (target.cp < 100 || target.l < targetData.l) {
				return;
			}
		} else if (element.pa[0].type == action.ACTION_TYPES.move && element.pa[0].info == order.SPECIAL_ORDERS.patrol && element.pa.length == 1) {
			// patrol
			element.pa.push(new gameData.Order(action.ACTION_TYPES.move, {x: element.p.x, y: element.p.y}, null, order.SPECIAL_ORDERS.patrol));
			element.pa.push(new gameData.Order(action.ACTION_TYPES.move, {x: element.pa[0].moveTo.x, y: element.pa[0].moveTo.y}, null, order.SPECIAL_ORDERS.patrol));
		}

		element.a = element.pa[0];
		element.pa.splice(0, 1);

	} else {

		element.a = null;
		element.fl = gameData.ELEMENTS_FLAGS.nothing;
	
	}

}

order.stopUnits = function (game, elementsIds) {

	var elements = tools.getGameElementsFromIds(game, elementsIds);

	for(var i in elements) {

		var element = elements[i];
		if (element.f == gameData.FAMILIES.unit) {
			element.a = null;
			element.pa = [];
			tools.addUniqueElementToArray(game.modified, element);
		}

	}

}

order.holdUnits = function (game, elementsIds) {

	var elements = tools.getGameElementsFromIds(game, elementsIds);

	for(var i in elements) {

		var element = elements[i];
		if (element.f == gameData.FAMILIES.unit) {
			element.a = new gameData.Order(action.ACTION_TYPES.hold, null, null);
			element.pa = [];
			tools.addUniqueElementToArray(game.modified, element);
		}
		
	}

}