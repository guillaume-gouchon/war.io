var moveLogic = {};


/**
*	Moves an element closer to its destination.
*/
moveLogic.moveElement = function (element) {
	if(gameLogic.grid[element.moveTo.x][element.moveTo.y].isWall
		&& tools.getPositionsDistance(element.position, element.moveTo) < 3) {
		//if end is blocked and we are at the closest
		element.moveTo.x = null;
		element.moveTo.y = null;
	} else {
		//use A* algorithm to find the path
		astar.tries = 0;
		var path = astar.search(gameLogic.grid, gameLogic.grid[element.position.x][element.position.y], 
								gameLogic.grid[element.moveTo.x][element.moveTo.y], true);
		if(path.length > 0) {

			//take into account the speed of the element
			var speed = element.speed;
			while(speed > path.length) {
				speed--;
			}

			var newPosition = {x : path[speed - 1].x, y : path[speed - 1].y};

			if(!gameLogic.grid[newPosition.x][newPosition.y].isWall) {
				//removes old position
				for (var i in element.shape) {
					for (var j in element.shape[i]) {
						if (element.shape[i][j] > 0) {
							var partPosition = tools.getPartPosition(element, i, j);
							gameLogic.grid[partPosition.x][partPosition.y].isWall = false;
						}
					}
				}
				//updates new position
				element.position = newPosition;
				for (var i in element.shape) {
					for (var j in element.shape[i]) {
						if (element.shape[i][j] > 0) {
							var partPosition = tools.getPartPosition(element, i, j);
							gameLogic.grid[partPosition.x][partPosition.y].isWall = true;
						}
					}
				}
			}
		} else {//no path or arrived to destination
			element.moveTo.x = null;
			element.moveTo.y = null;
		}
	}
}