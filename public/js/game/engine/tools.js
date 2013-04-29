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
*	Checks if this element is at this position (includes shape).
*/
tools.isElementThere = function (element, position) {
	var shape = gameData.ELEMENTS[element.f][element.r][element.t].shape;
	for(var i in shape) {
		for(var j in shape[i]) {
			if(shape[i][j] > 0) {
				var partPosition = this.getPartPosition(element, i, j);
				if(partPosition.x == position.x && partPosition.y == position.y) {
					return true;
				}
			}
		}
	}
	return false;
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
*	Returns the game element under the mouse.
*/
tools.getElementUnder = function (game, x, y) {
	for(var i in game.gameElements) {
		var element = game.gameElements[i];
	  	if(tools.isElementThere(element, {x : x, y : y})) {
	  		return element;
	  	}
	}
	return null;
}


/**
*	Returns the game elements from their ids.
*/
tools.getGameElementsFromIds = function (game, ids) {
	var elements = [];
	for (var i in game.gameElements) {
		var gameElement = game.gameElements[i];
		for (var j in ids) {
			if(gameElement.id == ids[j]) {
				elements.push(gameElement);
				if(elements.length == ids.length) {
					return elements;
				}
				break;
			}
		}
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
