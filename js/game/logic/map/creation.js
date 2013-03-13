var mapLogic = {};


/**
*	Creates a random map, sets up the terrain and the players basecamps.
*/
mapLogic.createRandomMap = function (map, players) {
	this.createGrid(map.size);
	this.createTerrain(map);
	
	var playerPositions = this.getPlayersPositions(map.size, players.length);
	for(var i in players) {
		this.setupBasecamp(players[i], playerPositions[i]);
	}


}


/**
*	Initializes the staticGrid.
*/
mapLogic.createGrid = function (size) {
	gameLogic.grid = [];
	for(var i = 0; i < size.x; i++) {
		gameLogic.grid[i] = [];
		for(var j = 0; j < size.y; j++) {
			gameLogic.grid[i][j] = {x : i, y : j, isWall : false};
		}
	}
}


/**
*	Creates the natural terrain tiles and resources of the map.
*/
mapLogic.createTerrain = function (map) {
	var nbTrees = parseInt(100 * Math.random());
	for(var i = 0; i < nbTrees; i++) {
		var position = [parseInt(Math.random() * map.size.x), parseInt(Math.random() * map.size.y)];
		this.addGameElement(new gameData.Terrain(gameData.TERRAINS.tree, position[0], position[1]));
	}

	var nbStone = parseInt(5 * Math.random());
	for(var i = 0; i < nbStone; i++) {
		var position = [parseInt( 2 + Math.random() * map.size.x - 4), parseInt( 2 + Math.random() * map.size.y - 4)];
		this.addGameElement(new gameData.Terrain(gameData.TERRAINS.stone, position[0], position[1]));
	}
}


/**
* Adds a game element on the map.
*/
mapLogic.addGameElement = function (element) {
	gameLogic.gameElements.push(element);
	for(var i in element.shape) {
		var row = element.shape[i];
		for(var j in row) {
			var part = row[j];
			if(part > 0) {
				var position = tools.getPartPosition(element, i, j);
				gameLogic.grid[position.x][position.y].isWall = true;
			}
		}
	}
}


/**
* Adds a game element on the map.
*/
mapLogic.removeGameElement = function (element) {
	for(var i in element.shape) {
		var row = element.shape[i];
		for(var j in row) {
			var part = row[j];
			if(part > 0) {
				var position = tools.getPartPosition(element, i, j);
				gameLogic.grid[position.x][position.y].isWall = false;
			}
		}
	}
}


/**
*	Sets up a base camp for a player.
*/
mapLogic.setupBasecamp = function (player, position) {
	var basecamp = gameData.BASECAMPS[player.race];

	//place town hall
	var townHall = new gameData.Building(basecamp.buildings[0], position.x, position.y, player.owner, true);
	this.addGameElement(townHall);
	
	//place units
	var aroundTownHall = tools.getTilesAroundElements(townHall);
	for(var i in basecamp.units) {
		this.addGameElement(new gameData.Unit(basecamp.units[i], aroundTownHall[i].x, aroundTownHall[i].y, player.owner));
	}
}


/**
*	Dispatches the players' basecamps through the map.
*/
mapLogic.getPlayersPositions = function (mapSize, nbPlayers) {
	var array = [];

	var dx = parseInt(mapSize.x / 3);
	var dy = parseInt(mapSize.y / 3);

	var occupied = [[0, 0, 0], [0, 1, 0], [0, 0, 0]];
	for (var i = 0; i < nbPlayers; i++) {
		var x = 1;
		var y = 1;
		while(occupied[x][y] > 0) {
			x = parseInt(Math.random() * 3);
			y = parseInt(Math.random() * 3);
		}
		occupied[x][y] = 1;
		if(x == 0) {
			occupied[x + 1][y] = 1;
		} else if (x == 1) {
			occupied[x + 1][y] = 1;
			occupied[x - 1][y] = 1;
		} else {
			occupied[x - 1][y] = 1;
		}
		if(y == 0) {
			occupied[x][y + 1] = 1;
		} else if (y == 1) {
			occupied[x][y + 1] = 1;
			occupied[x][y - 1] = 1;
		} else {
			occupied[x][y - 1] = 1;
		}

		x = x * dx + parseInt(dx / 4) + parseInt(Math.random() * dx / 2);
		y = y * dy + parseInt(dy / 4) + parseInt(Math.random() * dy / 2);

		array.push({x : x, y : y});
	}

	return array;
}