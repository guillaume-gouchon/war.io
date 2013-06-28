var gameLogic = {};


/**
*	Number of time the game is being updated by second.
*/
gameLogic.FREQUENCY = 3;


/**
*	Updates all the data related to the game logic itself : positions, life, ...
* 	It also checks if the game is ending.
*	Returns all the required elements.
*/
gameLogic.update = function (game) {
	game.modified = [];
	game.added = [];
	game.removed = [];

	// resolve players orders
	for (var i in game.orders) {
		order.dispatchReceivedOrder(game, game.orders[i][0], game.orders[i][1]);
	}
	game.orders = [];

	for (var n in game.players) {
		if (game.players[n].s != gameData.PLAYER_STATUSES.surrender) {
			game.players[n].s = gameData.PLAYER_STATUSES.defeat;
		}

        // AI plays
        if (game.players[n].ai){
            aiOrders.update(game, game.players[n]);
        }

	}

	// units
	for(var n in game.gameElements.unit) {
		var element  = game.gameElements.unit[n];
		this.resolveActions(game, element);
		this.updateMoves(game, element);
		this.protectAround(game, element);
	}

	// buildings
	for (var n in game.gameElements.building) {
		var element  = game.gameElements.building[n];

		if (game.players[element.o].s != gameData.PLAYER_STATUSES.surrender) {
			// player is still alive
			game.players[element.o].s = gameData.PLAYER_STATUSES.ig;
		}
		
		this.updateBuildings(game, element);
		if (tools.getElementData(element).attack != null) {
			this.resolveActions(game, element);
			this.protectAround(game, element);
		}
	}

	this.addNewBuildings(game);
	this.removeDeads(game);
	this.checkGameOver(game);
	stats.update(game);

	//handles chat messages
	var chatMessages = [];
	for (var i in game.chat) {
		chatMessages.push(game.chat[i]);
	}
	game.chat = [];

	return {
		modified : game.modified,
		added: game.added,
		removed: game.removed,
		players: game.players,
		chat: chatMessages
	};
}


/**
* 	Synchronizes user's build actions with the game loop.
*/
gameLogic.addNewBuildings = function (game) {
	for (var i in game.newBuildings) {
		game.newBuildings[i].l = 1;
		gameCreation.addGameElement(game, game.newBuildings[i]);
	}
	game.newBuildings = [];

	for (var i in game.cancelBuildings) {
		gameCreation.removeGameElement(game, game.cancelBuildings[i]);
	}

	game.cancelBuildings = [];
}


/**
*	Updates moving units' positions.
*/
gameLogic.updateMoves = function (game, element) {
	if(element.a != null && element.a.moveTo != null) {
		move.moveElement(game, element, element.a.moveTo);
		element.fl = gameData.ELEMENTS_FLAGS.moving;
		tools.addUniqueElementToArray(game.modified, element);
	}
}


/**
*	Depending on the action of the unit, change the destination,
*	and if close enough, resolve the action (build, fight...).
*/
gameLogic.resolveActions = function (game, element) {
	if (element.a != null && element.a.id != null) {

		var target = tools.getElementById(game, element.a.id);

		if (target != null) {

			var elementData = tools.getElementData(element);
			var distance = tools.getElementsDistance(element, target);

			// is close enough ?
			if (distance == 1) {

				// stop moving
				element.a.moveTo = null;
				element.fl = gameData.ELEMENTS_FLAGS.nothing;

				if (elementData.isBuilder && target.f == gameData.FAMILIES.building && rank.isAlly(game.players, element.o, target)) {

					if(element.ga != null) {
						
						// come back with some resources
						production.getBackResources(game, element);

					} else {

						// build / repair
						action.doTheBuild(game, element, target);

					}

				} else if (elementData.isBuilder && target.f == gameData.FAMILIES.land) {

					// gathering resources
					action.doTheGathering(game, element, target);

				} else if (rank.isEnemy(game.players, element.o, target)) {

					// attack
					action.doTheAttack(game, element, target);

				}

			} else if (distance <= elementData.range) {

				if (rank.isEnemy(game.players, element.o, target)) {
					
					// stop moving
					element.a.moveTo = null;

					// attack
					action.doTheAttack(game, element, target);

				}
				
			} else {

				// move closer in order to do the action
				var closest = tools.getClosestPart(element, target);
				element.a.moveTo = {x : closest.x, y : closest.y};

			}

			tools.addUniqueElementToArray(game.modified, element);

		} else {// the target does not exist anymore

			if (element.a.type == action.ACTION_TYPES.gather) {

				// find a new resource
				AI.searchForNewResources(game, element, element.a.info);

			} else if (element.a.type == action.ACTION_TYPES.move || element.a.type == action.ACTION_TYPES.patrol) {

				order.goToElementNextOrder(game, element);

			}
		}

	}
}


/**
*	Removes dead units from gameElements.	
*/
gameLogic.removeDeads= function (game) {
	for (var n in game.gameElements.unit) {
		var element = game.gameElements.unit[n];
		if (element.l <= 0) {
			production.removeUnit(game, element);
			gameCreation.removeGameElement(game, element);
			delete game.gameElements.unit[element.id];
		}
	}
}


/**
*	Updates buildings constructions, units production and research.
*/
gameLogic.updateBuildings = function (game, building) {
	if (building.q.length > 0) {
		production.updateQueueProgress(game, building);
		tools.addUniqueElementToArray(game.modified, building);
	}
}


/**
*	Stops the game if the winning conditions are reached.
*/
gameLogic.checkGameOver = function (game) {
	var nbPlayersDefeated = 0;
	var victory = -1;
	for (var i in game.players) {
		if (game.players[i].s == gameData.PLAYER_STATUSES.defeat
			|| game.players[i].s == gameData.PLAYER_STATUSES.surrender) {
			nbPlayersDefeated++;
		} else {
			victory = game.players[i].o;
		}
	}

	if (nbPlayersDefeated == game.players.length - 1) {
		game.players[victory].s = gameData.PLAYER_STATUSES.victory;
	}
}


/**
*	Aggressive AI.
*/
gameLogic.protectAround = function (game, element) {
	var elementData = tools.getElementData(element);
	if ((element.a == null || element.a.type == action.ACTION_TYPES.move && element.a.info == order.SPECIAL_ORDERS.attack)
		&& !elementData.isBuilder && (element.f == gameData.FAMILIES.unit || element.cp >= 100 && elementData.attack != null)) {
	
		AI.searchForNewEnemy(game, element);
	
	}

}
