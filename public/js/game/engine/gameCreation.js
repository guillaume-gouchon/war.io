var gameCreation = {};


/**
*	CONSTANTS
*/
gameCreation.PROBABILITY_TREE = 0.6;
gameCreation.ZONE_SIZE = 8;


/**
* Sets up a new game.
*/
gameCreation.createNewGame = function(map, players) {
	var game = new gameData.Game();
	for (var i in players) {
		var player = players[i];
		for(var n in map.ir.re) {
			player.re.push(map.ir.re[n].value);
		}
		for(var j in players) {
			if(j == i) {
				player.ra.push(gameData.RANKS.me);
			} else {
				player.ra.push(gameData.RANKS.enemy);
			}
		}
		game.players.push(player);
	}
	this.createNewMap(game, map, players);
	stats.init(game);
	return game;
}


/**
*	Creates a random map, sets up the land and the players basecamps.
*/
gameCreation.createNewMap = function (game, map, players) {
	game.grid = this.initGrid(map.size);
	if(map.t.id == gameData.MAP_TYPES.random.id) {
		this.createRandomMap(game, map, players);
	}

}


/**
*	Initializes the staticGrid.
*/
gameCreation.initGrid = function (size) {
	var grid = [];
	for(var i = 0; i < size.x; i++) {
		grid[i] = [];
		for(var j = 0; j < size.y; j++) {
			grid[i][j] = {x : i, y : j, isWall : false};
		}
	}
	return grid;
}


/**
*	Creates a random map.
*/
gameCreation.createRandomMap = function (game, map, players) {
	//get zones size
	var nX = parseInt(map.size.x / this.ZONE_SIZE);
	var nY = parseInt(map.size.y / this.ZONE_SIZE); 

	//init zones
	var zones = []
	for(var i = 0; i < nX; i++) {
		zones.push([]);
		for(var j = 0; j < nY; j++) {
			zones[i].push(-10);
		}
	}
	//dispatch players on the map
	this.dispatchPlayers(game, zones, players, nX, nY);

	//prepare the available zones according to the factors of the vegetation selected
	var availableZones = [];
	for(var i in map.ve.zones) {
		var zone = map.ve.zones[i];
		for(var n = 0; n < zone.factor; n++) {
			availableZones.push(zone.t);
		}
	}

	//dispatch zones on the map
	for(var i = 0; i < nX; i++) {
		for(var j = 0; j < nY; j++) {
			if(zones[i][j] < 0) {
				this.populateZone(game, map, {x : i * this.ZONE_SIZE + 1, y : j * this.ZONE_SIZE + 1}, {x : (i + 1) * this.ZONE_SIZE - 1, y : (j + 1) * this.ZONE_SIZE - 1}, 
							  availableZones[parseInt(Math.random() * availableZones.length)]);
			} else {
				this.populateZone(game, map, {x : i * this.ZONE_SIZE + 1, y : j * this.ZONE_SIZE + 1}, {x : (i + 1) * this.ZONE_SIZE - 1, y : (j + 1) * this.ZONE_SIZE - 1}, 
							  zones[i][j]);
			}
		}
	}

}


/**
*	Populates a zone with game elements.
*/
gameCreation.populateZone = function (game, map, from, to, zoneType) {
	switch (zoneType) {
		case gameData.ZONES.forest :
			this.createForest(game, from, to);
			break;
		case gameData.ZONES.stonemine:
			//this.createStoneMine(game, from, to);
			break;
		case gameData.ZONES.goldmine:
			this.createGoldMine(game, map, from, to);
			break;
	}
}


/**
*	Creates a forest zone.
*	@param from : top left-handed corner
*	@param to : bottom right-handed corner
*/
gameCreation.createForest = function (game, from, to) {
	for(var i = from.x; i < to.x; i++) {
		for(var j = from.y; j < to.y; j++) {
			if(Math.random() < this.PROBABILITY_TREE) {
				this.addGameElement(game, new gameData.Terrain(gameData.ELEMENTS[gameData.FAMILIES.land][0][0], i, j));
			}
		}
	}
}


/**
*	Create a gold mine zone.
*	@param from : top left-handed corner
*	@param to : bottom right-handed corner
*/
gameCreation.createGoldMine = function (game, map, from, to) {
	var element = gameData.ELEMENTS[gameData.FAMILIES.land][0][1];
	var position = this.getRandomPositionInZoneForElement(element, from, to);
	this.addGameElement(game, new gameData.Terrain(gameData.ELEMENTS[gameData.FAMILIES.land][0][1], position.x, position.y));
}


/**
*	Returns a random position in a zone for an element.
*/
gameCreation.getRandomPositionInZoneForElement = function (element, from, to) {
	return {
		x: parseInt(from.x + element.shape[0].length / 2 + Math.random() * (to.x - from.x - element.shape[0].length)),
		y: parseInt(from.y + element.shape.length / 2 + Math.random() * (to.y - from.y - element.shape.length))
	};
}


/**
* 	Adds a game element on the map.
*/
gameCreation.addGameElement = function (game, element) {
	var shape = gameData.ELEMENTS[element.f][element.r][element.t].shape;
	game.gameElements[element.f].push(element);
	for(var i in shape) {
		var row = shape[i];
		for(var j in row) {
			var part = row[j];
			if(part > 0) {
				var position = tools.getPartPosition(element, i, j);
				game.grid[position.x][position.y].isWall = true;
			}
		}
	}

	tools.addUniqueElementToArray(game.added, element);
}


/**
* Removes a game element on the map.
*/
gameCreation.removeGameElement = function (game, element) {
	var shape = gameData.ELEMENTS[element.f][element.r][element.t].shape;
	for(var i in shape) {
		var row = shape[i];
		for(var j in row) {
			var part = row[j];
			if(part > 0) {
				var position = tools.getPartPosition(element, i, j);
				game.grid[position.x][position.y].isWall = false;
			}
		}
	}
	tools.addUniqueElementToArray(game.removed, element);
}


/**
*	Dispatches the players' basecamps through the map.
*/
gameCreation.dispatchPlayers = function (game, zones, players, dx, dy) {
	//get player's available initial zones
	var availableInitialPositions = this.getAvailableInitialPositions(players.length);

	for (var i in players) {
		var r = parseInt(availableInitialPositions.length * Math.random());
		var playerZone = availableInitialPositions[r];
		
		//convert coordinates
		playerZone = {
			x : this.convertCoordinates(zones[0].length, playerZone.x),
			y : this.convertCoordinates(zones.length, playerZone.y)
		}

		availableInitialPositions.splice(r, 1);

		//this zone is now owned by the player
		zones[playerZone.x][playerZone.y] = gameData.ZONES.basecamp;
		var campPosition = {
			x : playerZone.x * this.ZONE_SIZE + parseInt(this.ZONE_SIZE / 4) + parseInt(Math.random() * this.ZONE_SIZE / 2), 
			y : playerZone.y * this.ZONE_SIZE + parseInt(this.ZONE_SIZE / 4) + parseInt(Math.random() * this.ZONE_SIZE / 2)
		}
		this.setupBasecamp(game, players[i], campPosition);

		//add a gold mine and a forest around the basecamp
		this.placeZoneRandomlyAround(gameData.ZONES.forest, zones, playerZone.x, playerZone.y);
		this.placeZoneRandomlyAround(gameData.ZONES.goldmine, zones, playerZone.x, playerZone.y);
	}

}


/**
*	Adds a land zone randomly around another zone
*/
gameCreation.placeZoneRandomlyAround = function (zoneToPlace, zones, aroundX, aroundY) {
	var x = null;
	var y = null;
	while (x == null || zones[x][y] == 1) {
		x = Math.min(zones[0].length - 1, Math.max(0, parseInt(aroundX + Math.random() * 2 - 1)));
		y = Math.min(zones.length - 1, Math.max(0, parseInt(aroundY + Math.random() * 2 - 1)));
	}
	zones[x][y] = zoneToPlace;
}


/**
*	Sets up a base camp for a player.
*/
gameCreation.setupBasecamp = function (game, player, position) {
	var basecamp = gameData.BASECAMPS[player.r];

	//place town hall
	var townHall = new gameData.Building(basecamp.buildings[0], position.x, position.y, player.o, true);
	this.addGameElement(game, townHall);
	
	//place units
	var aroundTownHall = tools.getTilesAroundElements(game, townHall);
	for(var i in basecamp.units) {
		this.addGameElement(game, new gameData.Unit(basecamp.units[i], aroundTownHall[i].x, aroundTownHall[i].y, player.o));
	}
}


/**
*	Returns players' available initial positions
*/
gameCreation.getAvailableInitialPositions = function (nbPlayers) {
	var initialPositions = [];
	if(nbPlayers != 4) {
		var map = [[0, 0, 0], [0, 1, 0], [0, 0, 0]];
		for(var i = 0; i < nbPlayers; i++) {
			var x = null;
			var y = null;
			while(x == null || map[x][y] > 0) {
				x = parseInt(Math.random() * 3);
				y = parseInt(Math.random() * 3);
			}

			map[x][y] = 1;
			initialPositions.push({x: x, y: y});

			if(nbPlayers <= 3) {
				if (x < 2) {
					map[x + 1][y] = 1;
				}
				if (x > 0) {
					map[x - 1][y] = 1;
				}
				if (y < 2) {
					map[x][y + 1] = 1;
				}
				if (y > 0) {
					map[x][y - 1] = 1;
				}
			}
		}
	} else {
		//4-player map = positions are set up as crosses
		if(Math.random() < 0.5) {
			initialPositions.push({x: 0, y: 0});
			initialPositions.push({x: 0, y: 2});
			initialPositions.push({x: 2, y: 0});
			initialPositions.push({x: 2, y: 2});
		} else {
			initialPositions.push({x: 1, y: 0});
			initialPositions.push({x: 1, y: 2});
			initialPositions.push({x: 0, y: 1});
			initialPositions.push({x: 2, y: 1});
		}
	}
	return initialPositions;
}


/**
*	Converts a coordinate of a 3 x 3 map to real map's one.
*/
gameCreation.convertCoordinates = function (mapSize, coordinate) {
	if(coordinate == 0) { 
		return 1;
	} else if (coordinate == 1) {
		return parseInt(mapSize / 2);
	} else {
		return mapSize - 2;
	}
}
