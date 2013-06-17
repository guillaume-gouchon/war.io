var tools = {};


/**
*	Returns the distance between two positions.
*/
tools.getPositionsDistance = function (position1, position2) {
	return Math.max(Math.abs(position1.x - position2.x), Math.abs(position1.y - position2.y));
}


/**
*	Returns the distance between two elements (including shapes).
*/
tools.getElementsDistance = function (element1, element2) {
	var min = 10000;
	if(element2 != null) {
		var shape = gameData.ELEMENTS[element2.f][element2.r][element2.t].shape;
		for(var i in shape) {
			for(var j in shape[i]) {
				var distance = this.getPositionsDistance(element1.p, this.getPartPosition(element2, i, j));
				if(distance < min) {
					min = distance;
				}
				if(min == 1) {
					return min;
				}
			}
		}
	}

	return min;
}


/**
*	Returns the closest part position from element 2 to element 1.
*/
tools.getClosestPart = function (element1, element2) {
	var min = 10000;
	var closest;
	var shape = gameData.ELEMENTS[element2.f][element2.r][element2.t].shape;
	for(var i in shape) {
		for(var j in shape[i]) {
			var distance = this.getPositionsDistance(element1.p, this.getPartPosition(element2, i, j));
			if(distance < min) {
				min = distance;
				closest = this.getPartPosition(element2, i, j);
			}
			if(min == 1) {
				return closest;
			}
		}
	}

	return closest;
}


/**
*	Returns the position of an element's part.
*/
tools.getPartPosition = function (element, i, j) {
	var shape = null;
	if(element.shape == null) {
		shape = gameData.ELEMENTS[element.f][element.r][element.t].shape;
	} else {
		shape = element.shape;
	}
	return {
		x : parseInt(element.p.x + parseInt(i) - parseInt(shape[0].length / 2)),
		y : parseInt(element.p.y + parseInt(j) - parseInt(shape.length / 2))
	}
}


/**
*	Returns closest tiles around the element.
*/
tools.getTilesAroundElements = function (game, element) {
	var array = [];
	var shape = gameData.ELEMENTS[element.f][element.r][element.t].shape;
	for(var i in shape) {
		for(var j in shape[i]) {
			if(shape[i][j] > 0) {
				var partPosition = this.getPartPosition(element, i, j);
				var neighbors = astar.neighbors(game.grid, game.grid[partPosition.x][partPosition.y], true);
				for(var n in neighbors) {
					var neighbor = neighbors[n];
					if(!neighbor.isWall) {
						array.push({x : neighbor.x, y : neighbor.y});
					}
				}
			}		
		}
	}
	return array;
}


/**
*	Returns the game elements from their ids.
*/
tools.getGameElementsFromIds = function (game, ids) {
	var elements = [];
	for (var i in ids) {
		elements.push(game.gameElements[Object.keys(gameData.FAMILIES)[ids[i].charAt(0)]][ids[i]]);
	}

	return elements;
}


/**
*	Adds an element to a set of unique elements.
*/
tools.addUniqueElementToArray = function (array, element) {
	var index = array.indexOf(element);
	if (index == -1) {		
		array.push(element);
	}
}


/**
*	Copies an object and avoids circular structure.
*/
tools.clone = function (obj) {
    var copy = {};
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr) && attr != 'a') copy[attr] = obj[attr];
    }
    return copy;
}


/**
*	Returns the nearest specified element.
*/
tools.getNearestStuff = function (game, fromElement, family, type, rank, noLimit) {

	var nearestStuff = null;

	if (noLimit) {// search within the limit of the element's vision

		var distance = 0;

		do {
			distance ++;
			nearestStuff = tools.searchInTiles(game, this.getTilesAround(game.grid, fromElement.p, distance, false), fromElement, family, type, rank);
		} while (nearestStuff == null && distance < gameData.ELEMENTS[fromElement.f][fromElement.r][fromElement.t].vision);
	
	} else {// search anywhere

		var min = 1000;
		for (var i in game.gameElements[Object.keys(gameData.FAMILIES)[family]]) {
			var element = game.gameElements[Object.keys(gameData.FAMILIES)[family]][i];
			if ((type == null || element.t == type) && (rank == null || game.players[fromElement.o].ra[element.o] == rank)) {
				var distance = this.getElementsDistance(fromElement, element);
				if (distance < min) {
					min = distance;
					nearestStuff = element;
					if (min < 5) { return nearestStuff; }
				}
			}  
		}

	}

	return nearestStuff;
}


/**
*	Returns tiles inside a square.
*/
tools.getTilesAround = function (grid, center, size, isFilled) {
	var tiles = [];
	
	for (var i = center.x - size; i <= center.x + size; i++) {
		if (grid[i]) {
			if (isFilled || i == center.x - size || i == center.x + size) {
				for (var j = center.y - size; j <= center.y + size; j++) {
					if (grid [i][j]) {
						tiles.push(grid[i][j]);
					}
				}
			} else {
				if (grid [i][center.y - size]) {
					tiles.push(grid[i][center.y - size]);
				} else if (grid [i][center.y + size]) {
					tiles.push(grid[i][center.y + size]);
				};
			}
		}
	}

	return tiles;
}


/**
*	Search for any element in a list of tiles.
*/
tools.searchInTiles = function (game, tiles, fromElement, family, type, rank) {

	for (var i in tiles) {
		// if there is something
		if (tiles[i].content != null) {
			var content = game.gameElements[Object.keys(gameData.FAMILIES)[family]][tiles[i].content];
			if (content != null && content.f == family && (type == null || content.t == type)
				&& (rank == null || game.players[fromElement.o].ra[content.o] == rank)) {
				return content;
			}
		}
	}
	
	return null;
}
