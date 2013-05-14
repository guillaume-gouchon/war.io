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
	surrender : 6
}


order.dispatchReceivedOrder = function (game, type, params) {
	switch (type) {
		case 0 :
			this.convertDestinationToOrder(game, params[0], params[1], params[2]);
			break;
		case 1 :
			this.buildThatHere(game, params[0], params[1], params[2], params[3]);
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
	}
}


order.buildThatHere = function (game, buildersIds, building, x, y) {
	var builders = tools.getGameElementsFromIds(game, buildersIds);
	var building = new gameData.Building(building, x, y, builders[0].o, false);
	production.startConstruction(game, building);
	//give order to builders
	this.build(game, builders, building);
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
		var buttons = gameData.ELEMENTS[building.f][building.r][building.t].buttons;
		if(buttons.length > 0) {
			building.rp = {x: x, y: y};
		}
		tools.addUniqueElementToArray(game.modified, building);
	}
}


order.attack = function (game, elements, target) {
	for(var i in elements) {
		var element = elements[i];
		element.pa = null;
		element.a = target;
		tools.addUniqueElementToArray(game.modified, element);
	}
}


order.build = function (game, builders, building) {
	for(var i in builders) {
		var element = builders[i];
		element.pa = null;
		element.a = building;
		tools.addUniqueElementToArray(game.modified, element);
	}
}


order.move = function (game, units, x, y) {
	for(var i in units) {
		var element = units[i];
		element.pa = null;
		element.a = null;
		element.mt = {x : x, y : y};
		tools.addUniqueElementToArray(game.modified, element);
	}
}


order.gather = function (game, units, land) {
	for(var i in units) {
		var element = units[i];
		element.a = land;
		element.pa = land;
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
order.convertDestinationToOrder = function (game, elementsIds, x, y) {
	var elements = tools.getGameElementsFromIds(game, elementsIds);
	if (elements.length == 0 || x >= game.grid[0].length
		|| y >= game.grid.length) {
		return;
	}

	if(elements[0].f == gameData.FAMILIES.building) {
		//buildings are selected
		this.updateRallyingPoint(game, elements, x, y);
	} else {
		//units are selected
		var element = tools.getElementUnder(game, x, y);
		if (element != null) {
			//something is under the click
			if (element.f == gameData.FAMILIES.unit) {
				if (!rank.isAlly(game.players, elements[0].o, element)) {
					//enemy unit
					this.attack(game, elements, element);
					return;
				}
			} else if (element.f == gameData.FAMILIES.building) {
				if (rank.isAlly(game.players, elements[0].o, element)) {
					//friend building
					for(var i in elements) {
						var e = elements[i];
						if(gameData.ELEMENTS[e.f][e.r][e.t].isBuilder) {
							//builders are sent to build / repair
							order.build(game, [e], element);
						} else {
							//non-builders are given a move order
							order.move(game, [e], x, y);
						}
					}
					return;
				} else {
					//enemy building
					order.attack(game, elements, element);
					return;
				}
			} else if (element.f == gameData.FAMILIES.land 
						&& gameData.ELEMENTS[element.f][0][element.t].resourceType >= 0) {
				//resource land element
				for(var i in elements) {
					var e = elements[i];
					if(gameData.ELEMENTS[e.f][e.r][e.t].isBuilder) {
						//builders are sent to gather resources
						order.gather(game, [e], element);
						e.a = element;
					} else {
						//non-builders are given a move order
						order.move(game, [e], x, y);
					}
				}
				return;
			}
		}

		//if no target, just give a move order
		order.move(game, elements, x, y);
	}
	
}
