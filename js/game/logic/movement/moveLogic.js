var moveLogic = {};


/**
*	Moves an element closer to its destination.
*/
moveLogic.moveElement = function (element) {
	var destination = gameLogic.grid[element.moveTo.x][element.moveTo.y];
	var counter = 0;
	while(destination.isWall && counter < 20) {
		counter++;
	    var endNeighbors = astar.neighbors(gameLogic.grid, destination, true);
	    for(var i in endNeighbors){
	      if(!endNeighbors[i].isWall) {
	        destination = endNeighbors[i];
	        element.moveTo = {x : destination.x, y : destination.y};
	        break;
	      }
	    }
	}
	
	//use A* algorithm to find the path
	var path = astar.search(gameLogic.grid, gameLogic.grid[element.position.x][element.position.y], 
							destination, true);
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

		//if element has arrived to its destination
		if(element.moveTo.x == element.position.x && element.moveTo.y == element.position.y) {
			element.moveTo = {x : null, y : null};
		}
	}

}