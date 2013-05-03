var gameContent = {};


/**
*	Important data.
*/
gameContent.map = null;
gameContent.players = null;
gameContent.myArmy = null;
gameContent.game = null;


/**
*	Main variable used during the game.
*  	It contains all the terrain's elements, units and buildings.
*/
gameContent.gameElements = {};


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
	//add new elements
	for (var i in data) {
		var element = data[i];
		gameSurface.addElement(element);
		//center camera
		if (element.f == gameData.FAMILIES.building
			&& element.o == this.myArmy) {
			gameSurface.centerCameraOnElement(element);
		}
	}
}


/**
*	Updates the game content with the changes the engine sent us.	
*/
gameContent.update = function (data) {
	//add new elements
	for (var i in data.added) {
		var element = data.added[i];
		if (this.gameElements[element.id] == null) {
			gameSurface.addElement(element);
		}
	}
	//remove some elements
	for (var i in data.removed) {
		var element = data.removed[i];
		if (this.gameElements[element.id] != null) {
			var index = this.selected.indexOf(element.id);
			if (index >= 0) {
				this.selected.splice(index, 1);
			}
			gameSurface.removeElement(element);
		}
	}
	//update some modified elements
	for (var i in data.modified) {
		var element = data.modified[i];
		if (this.gameElements[element.id] != null) {
			gameSurface.updateElement(element);
		}
	}

	//check if someone has changed its rank
	for (var i in this.players) {
		for (var j in this.players[i].ra) {
			if (this.players[i].ra[j] != data.players[i].ra[j]) {
				this.rankHasChanged(data.players[i], j);
			}
		}
	}

	//update players
	this.players = data.players;

	//check for victory / defeat
	if (this.players[this.myArmy].s == gameData.PLAYER_STATUSES.victory
		|| this.players[this.myArmy].s == gameData.PLAYER_STATUSES.defeat) {
		gameManager.endGame(this.players[this.myArmy].s);
	}

	//handles chat messages
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

