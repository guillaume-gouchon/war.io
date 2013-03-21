var mapLogic = {};


/**
*	CONSTANTS
*/
mapLogic.ZONES_NUMBER = 10;
mapLogic.PROBABILITY_TREE = 0.6;


/**
*	Creates a random map, sets up the terrain and the players basecamps.
*/
mapLogic.createNewMap = function (map, players) {
	this.initGrid(map.size);
	if(map.t.id == gameData.MAP_TYPES.random.id) {
		this.createRandomMap(map, players);
	}

}


/**
*	Initializes the staticGrid.
*/
mapLogic.initGrid = function (size) {
	gameLogic.grid = [];
	for(var i = 0; i < size.x; i++) {
		gameLogic.grid[i] = [];
		for(var j = 0; j < size.y; j++) {
			gameLogic.grid[i][j] = {x : i, y : j, isWall : false};
		}
	}
}


/**
*	Creates a random map.
*/
mapLogic.createRandomMap = function (map, players) {
	//get zones size
	var dx = parseInt(map.size.x / this.ZONES_NUMBER);
	var dy = parseInt(map.size.y / this.ZONES_NUMBER); 

	//init zones
	var zones = []
	for(var i = 0; i < this.ZONES_NUMBER; i++) {
		zones.push([]);
		for(var j = 0; j < this.ZONES_NUMBER; j++) {
			zones[i].push(-10);
		}
	}
	//dispatch players on the map
	this.dispatchPlayers(zones, players, dx, dy);

	//prepare the available zones according to the factors of the vegetation selected
	var availableZones = [];
	for(var i in map.ve.zones) {
		var zone = map.ve.zones[i];
		for(var n = 0; n < zone.factor; n++) {
			availableZones.push(zone.t);
		}
	}

	//dispatch zones on the map
	for(var i = 0; i < this.ZONES_NUMBER; i++) {
		for(var j = 0; j < this.ZONES_NUMBER; j++) {
			if(zones[i][j] < 0) {
				this.populateZone({x : i * dx + 1, y : j * dy + 1}, {x : (i + 1) * dx - 1, y : (j + 1) * dy - 1}, 
							  availableZones[parseInt(Math.random() * availableZones.length)]);
			} else {
				this.populateZone({x : i * dx + 1, y : j * dy + 1}, {x : (i + 1) * dx - 1, y : (j + 1) * dy - 1}, 
							  zones[i][j]);
			}
		}
	}

}


/**
*	Populates a zone with game elements.
*/
mapLogic.populateZone = function (from, to, zoneType) {
	switch (zoneType) {
		case gameData.ZONES.forest :
			this.createForest(from, to);
			break;
		case gameData.ZONES.stonemine:
			this.createStoneMine(from, to);
			break;
		case gameData.ZONES.goldmine:
			this.createGoldMine(from, to);
			break;
	}
}


/**
*	Creates a forest zone.
*	@param from : top left-handed corner
*	@param to : bottom right-handed corner
*/
mapLogic.createForest = function (from, to) {
	for(var i = from.x; i < to.x; i++) {
		for(var j = from.y; j < to.y; j++) {
			if(Math.random() < this.PROBABILITY_TREE) {
				this.addGameElement(new gameData.Terrain(gameData.ELEMENTS[gameData.FAMILIES.terrain][0][0], i, j));
			}
		}
	}
}


/**
*	Creates a stone mine zone.
*	@param from : top left-handed corner
*	@param to : bottom right-handed corner
*/
mapLogic.createStoneMine = function (from, to) {
	for(var i = from.x; i < to.x; i++) {
		for(var j = from.y; j < to.y; j++) {
			if(Math.random() < 0.1) {
				this.addGameElement(new gameData.Terrain(gameData.ELEMENTS[gameData.FAMILIES.terrain][0][1], i, j));
				return;
			}
		}
	}
}


/**
*	Create a gold mine zone.
*	@param from : top left-handed corner
*	@param to : bottom right-handed corner
*/
mapLogic.createGoldMine = function (from, to) {
	for(var i = from.x; i < to.x; i++) {
		for(var j = from.y; j < to.y; j++) {
			if(Math.random() < 0.1) {
				this.addGameElement(new gameData.Terrain(gameData.ELEMENTS[gameData.FAMILIES.terrain][0][2], i, j));
				return;
			}
		}
	}
}


/**
* Adds a game element on the map.
*/
mapLogic.addGameElement = function (element) {
	var shape = gameData.ELEMENTS[element.f][element.r][element.t].shape;
	gameLogic.gameElements.push(element);
	for(var i in shape) {
		var row = shape[i];
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
	var shape = gameData.ELEMENTS[element.f][element.r][element.t].shape;
	for(var i in shape) {
		var row = shape[i];
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
*	Dispatches the players' basecamps through the map.
*/
mapLogic.dispatchPlayers = function (zones, players, dx, dy) {
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
			x : playerZone.x * dx + parseInt(dx / 4) + parseInt(Math.random() * dx / 2), 
			y : playerZone.y * dy + parseInt(dy / 4) + parseInt(Math.random() * dy / 2)
		}
		this.setupBasecamp(players[i], campPosition);

		//add a gold mine and a forest around the basecamp
		this.placeZoneRandomlyAround(gameData.ZONES.forest, zones, playerZone.x, playerZone.y);
		this.placeZoneRandomlyAround(gameData.ZONES.goldmine, zones, playerZone.x, playerZone.y);
	}

}


/**
*	Adds a terrain zone randomly around another zone
*/
mapLogic.placeZoneRandomlyAround = function (zoneToPlace, zones, aroundX, aroundY) {
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
mapLogic.setupBasecamp = function (player, position) {
	var basecamp = gameData.BASECAMPS[player.r];

	//place town hall
	var townHall = new gameData.Building(basecamp.buildings[0], position.x, position.y, player.o, true);
	this.addGameElement(townHall);
	
	//place units
	var aroundTownHall = tools.getTilesAroundElements(townHall);
	for(var i in basecamp.units) {
		this.addGameElement(new gameData.Unit(basecamp.units[i], aroundTownHall[i].x, aroundTownHall[i].y, player.o));
	}
}


/**
*	Returns players' available initial positions
*/
mapLogic.getAvailableInitialPositions = function (nbPlayers) {
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
mapLogic.convertCoordinates = function (mapSize, coordinate) {
	if(coordinate == 0) { 
		return 1;
	} else if (coordinate == 1) {
		return parseInt(mapSize / 2);
	} else {
		return mapSize - 2;
	}
}
