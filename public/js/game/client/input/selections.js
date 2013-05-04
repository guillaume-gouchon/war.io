
/**
*	The user is clicking on the screen to select / unselect some elements.
* 	@param (x, y) : coordinates of the click
*/
userInput.clickToSelect = function (x, y) {
	//click on minimap
	if (x > window.innerWidth - GUI.MINIMAP_SIZE && y > window.innerHeight - GUI.MINIMAP_SIZE) {
		return;
	}

	this.leaveConstructionMode();

	//reset selected array
	gameSurface.unselectAll();
	gameContent.selected = [];

	//reset the selection rectangle
	gameContent.selectionRectangle = [];
	gameSurface.updateSelectionRectangle(-1, -1, -1, -1);

	gameContent.selectionRectangle[0] = x;
	gameContent.selectionRectangle[1] = y;
}


/**
* 	The user is drawing a selection rectangle to select some elements.
* 	@param (x, y) : current coordinates of the mouse
*/
userInput.selectGroup = function (x, y) {
	if(gameContent.selectionRectangle.length > 0) {

			//unselect the previous selected elements
			gameSurface.unselectAll();
			gameContent.selected = [];

			var unitSelected = false;

			gameSurface.updateSelectionRectangle(gameContent.selectionRectangle[0], gameContent.selectionRectangle[1], x, y);

			var position1 = gameSurface.getFirstIntersectObject(gameContent.selectionRectangle[0], gameContent.selectionRectangle[1]).point;
			var position2 = gameSurface.getFirstIntersectObject(x, y).point;

			var gamePosition1 = gameSurface.convertScenePositionToGamePosition(position1);
			var gamePosition2 = gameSurface.convertScenePositionToGamePosition(position2);
			var selectionRectangleGamePosition = [
				gamePosition1.x, gamePosition1.y, gamePosition2.x, gamePosition2.y
			];

			for(var i in gameContent.gameElements) {
				var element = gameContent.gameElements[i].s;
	  			if(rank.isAlly(gameContent.players, gameContent.myArmy, element)
	  				&& element.f != gameData.FAMILIES.terrain
	  				&& (selectionRectangleGamePosition[0] - selectionRectangleGamePosition[2] < 0 
			  		&& element.p.x <= selectionRectangleGamePosition[2]
			  		&& element.p.x >= selectionRectangleGamePosition[0]
			  		|| element.p.x >= selectionRectangleGamePosition[2]
			  		&& element.p.x <= selectionRectangleGamePosition[0])
			  		&& (selectionRectangleGamePosition[1] - selectionRectangleGamePosition[3] < 0 
			  		&& element.p.y <= selectionRectangleGamePosition[3]
			  		&& element.p.y >= selectionRectangleGamePosition[1]
			  		|| element.p.y >= selectionRectangleGamePosition[3]
			  		&& element.p.y <= selectionRectangleGamePosition[1])) {
				  		gameContent.selected.push(element.id);
			  	  		gameSurface.selectElement(element.id);
				  		if(element.f == gameData.FAMILIES.unit) {
				  			unitSelected = true;
				  		}
			  	}
			}

			//unselect the buildings if one or more units are selected
			if(unitSelected) {
				var len = gameContent.selected.length;
				while(len--) {
					var element = gameContent.gameElements[gameContent.selected[len]].s;
					if(element.f == gameData.FAMILIES.building) {
						gameContent.selected.splice(len, 1);
				  		gameSurface.unselectElement(element.id);
					}
				}
			}

		}
}


/**
*	Removes the selection rectangle.
*/
userInput.removeSelectionRectangle = function () {
	gameContent.selectionRectangle = [];
	gameSurface.updateSelectionRectangle(-1, -1, -1, -1);
}


/**
*	Selects all similar ally units.
*/
userInput.doubleClickToSelect = function (x, y) {
	if(gameContent.selected.length > 0 && rank.isAlly(gameContent.players, gameContent.myArmy, gameContent.gameElements[gameContent.selected[0]].s)) {
		var selected = gameContent.gameElements[gameContent.selected[0]].s;
		for(var i in gameContent.gameElements) {
			var element = gameContent.gameElements[i].s;
		  	if(element.f == selected.f && rank.isAlly(gameContent.players, gameContent.myArmy, element)
		  		&& element.t == selected.t) {
		  		//select the clicked element
		  		gameContent.selected.push(element.id);
	  	  		gameSurface.selectElement(element.id);
		  	}
		}
	}
}