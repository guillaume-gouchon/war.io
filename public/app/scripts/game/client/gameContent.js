var gameContent = {};


/**
*	Useful game information.
*/
gameContent.gameId = null;
gameContent.map = null;
gameContent.players = null;
gameContent.myArmy = null;
gameContent.isRunning = false;


/**
*	Used only in offline game
*/
gameContent.game = null;


/**
*	Main variable used during the game.
*  	It contains all the land's elements, units and buildings.
*/
gameContent.gameElements = {
	land: {},
	building: {},
	unit: {}
};


/**
*	Tells which tile is occupied and which tile is free.
*/
gameContent.grid = [];


/**
*	Contains the current selected elements ids.
*/
gameContent.selected = [];


/**
*	Contains the building that the user wants to construct.
*/
gameContent.building = null;


/**
*	Contains the coordinates of the selection rectangle.
*/
gameContent.selectionRectangle = [];


/**
*	Initializes the game content by retrieving all the game elements from the engine.
*/
gameContent.init = function (data) {

	// init grid
	for(var i = 0; i < this.map.size.x; i++) {
		this.grid[i] = [];
		for(var j = 0; j < this.map.size.y; j++) {
			this.grid[i][j] = 0;
		}
	}

	// add new elements
	for (var i in data) {
		for (var j in data[i]) {
			var element = data[i][j];
			gameSurface.addElement(element);	
			// center camera on town hall
			if (element.f == gameData.FAMILIES.building && element.o == this.myArmy) {
				gameSurface.centerCameraOnElement(utils.getElementFromId(element.id));
			}
		}
	}

}


/**
*	Updates the game content with the changes the engine sent us.	
*/
gameContent.update = function (data) {	

	// add new elements
	for (var i in data.added) {
		var element = data.added[i];
		if (utils.getElementFromId(element.id) == null) {
			gameSurface.addElement(element);
		}
	}

	// remove some elements
	for (var i in data.removed) {
		var element = data.removed[i];
		if (utils.getElementFromId(element.id) != null) {
			gameSurface.removeElement(element);
		}
	}

	// update some modified elements
	for (var i in data.modified) {
		var element = data.modified[i];
		if (utils.getElementFromId(element.id) != null) {
			gameSurface.updateElement(element);
		}
	}

	// update fogs of war
	gameSurface.manageElementsVisibility();

	// check some diplomacy changes
	for (var i in this.players) {
		for (var j in this.players[i].ra) {
			if (this.players[i].ra[j] != data.players[i].ra[j]) {
				this.rankHasChanged(data.players[i], data.players[j]);
			}
		}
	}

	// update players
	this.players = data.players;

	// check for victory / defeat (Offline game only)
	if (gameManager.isOfflineGame && this.players[this.myArmy].s == gameData.PLAYER_STATUSES.victory
		|| this.players[this.myArmy].s == gameData.PLAYER_STATUSES.defeat
		|| this.players[this.myArmy].s == gameData.PLAYER_STATUSES.surrender) {
		// show the stats and stop the game
		gameManager.showStats(this.players[this.myArmy].s, gameContent.game.stats);
		clearInterval(gameManager.offlineGameLoop);
	}

	// show chat messages
	for (var i in data.chat) {
		gameSurface.showMessage({id: parseInt(Math.random() * 1000), text: data.chat[i].text}, gameSurface.PLAYERS_COLORS[data.chat[i].o]);
	}
}


/**
*	One player's rank has changed.
*/
gameContent.rankHasChanged = function (player1, player2) {
	if (player1.ra[player2.o] == gameData.RANKS.enemy) {
		gameSurface.showMessage({id: parseInt(Math.random() * 1000), text: player1.n + ' has declared the war to ' + player2.n + ' !'});
	} else if (player1.ra[player2.o] == gameData.RANKS.neutral
		&& player2.ra[player1.o] == gameData.RANKS.neutral) {
		gameSurface.showMessage({id: parseInt(Math.random() * 1000), text: player1.n + ' and ' + player2.n + ' have signed an alliance !'});
	} else if (player1.ra[player2.o] == gameData.RANKS.neutral) {
		gameSurface.showMessage({id: parseInt(Math.random() * 1000), text: player1.n + ' wants to conclude a pact with ' + player2.n + '...'});
	}
}
