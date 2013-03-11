/**
*	Returns the distance between two positions.
*/
tools.getPositionsDistance = function (position1, position2) {
	return Math.max(Math.abs(position1.x - position2.x) + Math.abs(position1.y - position2.y));
}


/**
*	Returns the distance between two elements (includes shapes).
*/
tools.getElementsDistance = function (element1, element2) {
	var min = 10000;
	for(var i in element2.shape) {
		for(var j in element2.shape[i]) {
			var distance = this.getPositionsDistance(element1.position, this.getPartPosition(element2, i, j));
			if(distance < min) {
				min = distance;
			}
			if(min == 1) {
				return min;
			}
		}
	}

	return min;
}


/**
*	Returns the closest part from the element 2 to element 1.
*/
tools.getClosestPart = function (element1, element2) {
	var min = 10000;
	var closest;
	for(var i in element2.shape) {
		for(var j in element2.shape[i]) {
			var distance = this.getPositionsDistance(element1.position, this.getPartPosition(element2, i, j));
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
*	Returns the position of an element's shape's part.
*/
tools.getPartPosition = function (element, i, j) {
	return {
		x : parseInt(element.position.x + parseInt(i) - parseInt(element.shape[0].length / 2)),
		y : parseInt(element.position.y + parseInt(j) - parseInt(element.shape.length / 2))
	}
}


/**
*	Checks if an element is at this position (includes shape).
*/
tools.isElementThere = function (element, position) {
	for(var i in element.shape) {
		for(var j in element.shape[i]) {
			if(element.shape[i][j] > 0) {
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
tools.getTilesAroundElements = function (element) {
	var array = [];
	for(var i in element.shape) {
		for(var j in element.shape[i]) {
			if(element.shape[i][j] > 0) {
				var partPosition = this.getPartPosition(element, i, j);
				var neighbors = astar.neighbors(gameLogic.grid, gameLogic.grid[partPosition.x][partPosition.y], true);
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
*	Returns the game element under the mouse/	
*/
tools.getElementUnder = function (x, y) {
	for(var i in gameLogic.gameElements) {
		var element = gameLogic.gameElements[i];
	  	if(tools.isElementThere(element, {x : x, y : y})) {
	  		return element;
	  	}
	}
	return null;
}