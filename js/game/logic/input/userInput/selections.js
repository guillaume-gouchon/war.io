/**
*		CONSTANTS
*/
userInput.SELECTION_RECTANGLE_THRESHOLD = 2; //in pixels


/**
*	The user is clicking on the screen to select / unselect some elements.
* 	@param (x, y) : coordinates of the click
*/
userInput.clickToSelect = function (x, y) {
	this.leaveConstructionMode();

	//reset the selection rectangle
	gameLogic.selectionRectangle = [];
	gameLogic.selectionRectangle[0] = x;
	gameLogic.selectionRectangle[1] = y;

	//reset selected array
	gameLogic.selected = [];

	var position = gameSurface.getAbsolutePositionFromPixel(x, y);


	for(var i in gameLogic.gameElements) {
		var element = gameLogic.gameElements[i];
	  	if(tools.isElementThere(element, {x : position.x, y : position.y})) {
	  		//select the clicked element
	  		element.isSelected = true;
	  		gameLogic.selected.push(element);
	  	} else {
	  		//unselect the others
	  		element.isSelected = false;
		}
	}

}


/**
* 	The user is drawing a selection rectangle to select some elements.
* 	@param (x, y) : current coordinates of the mouse
*/
userInput.selectGroup = function (x, y) {
	if(gameLogic.selectionRectangle.length > 0 
		&& Math.abs(x - gameLogic.selectionRectangle[0]) > this.SELECTION_RECTANGLE_THRESHOLD
		&& Math.abs(y - gameLogic.selectionRectangle[1]) > this.SELECTION_RECTANGLE_THRESHOLD) {
			display.updateMouse(display.MOUSE_ICONS.select);

			//get the last coordinates of the selection rectangle
			gameLogic.selectionRectangle[2] = x - gameLogic.selectionRectangle[0];
			gameLogic.selectionRectangle[3] = y - gameLogic.selectionRectangle[1];

			//unselect the previous selected elements
			gameLogic.selected = [];

			var unitSelected = false;

			var rectangleOrigin = gameSurface.getAbsolutePositionFromPixel(gameLogic.selectionRectangle[0], gameLogic.selectionRectangle[1]);
			var rectangleSize = {
				width : parseInt(gameLogic.selectionRectangle[2] / gameLogic.PIXEL_BY_NODE),
				height : parseInt(gameLogic.selectionRectangle[3] / gameLogic.PIXEL_BY_NODE)
			};

			for(var i in gameLogic.gameElements) {
				var element = gameLogic.gameElements[i];
	  			if(fightLogic.isAlly(element)
	  				&& element.family != gameData.FAMILIES.terrain
	  				&& (gameLogic.selectionRectangle[2] > 0 
			  		&& element.position.x <= rectangleOrigin.x + rectangleSize.width
			  		&& element.position.x >= rectangleOrigin.x
			  		|| element.position.x >= rectangleOrigin.x + rectangleSize.width
			  		&& element.position.x <= rectangleOrigin.x)
			  		&& (gameLogic.selectionRectangle[3] > 0 
			  		&& element.position.y <= rectangleOrigin.y + rectangleSize.height
			  		&& element.position.y >= rectangleOrigin.y
			  		|| element.position.y >= rectangleOrigin.y + rectangleSize.height
			  		&& element.position.y <= rectangleOrigin.y)) {
				  		//select the elements in the rectangle
				  		element.isSelected = true;
				  		gameLogic.selected.push(element);
				  		if(element.family == gameData.FAMILIES.unit) {
				  			unitSelected = true;
				  		}
			  	} else {
				  		//unselect the others
				  		element.isSelected = false;
			  	}
			}

			//unselect the buildings if one or more units are selected
			if(unitSelected) {
				var len = gameLogic.selected.length;
				while(len--) {
					var element = gameLogic.selected[len];
					if(element.family == gameData.FAMILIES.building) {
						element.isSelected = false;
						gameLogic.selected.splice(len, 1);
					}
				}
			}

		}
}


/**
*	Removes the selection rectangle.
*/
userInput.removeSelectionRectangle = function () {
	gameLogic.selectionRectangle = [];
}


/**
*	Selects all similar ally units.
*/
userInput.doubleClickToSelect = function (x, y) {
	if(gameLogic.selected.length > 0 && fightLogic.isAlly(gameLogic.selected[0])) {
		var selected = gameLogic.selected[0];
		for(var i in gameLogic.gameElements) {
			var element = gameLogic.gameElements[i];
		  	if(element.family == selected.family && fightLogic.isAlly(element)
		  		&& element.type == selected.type) {
		  		//select the clicked element
		  		element.isSelected = true;
		  		gameLogic.selected.push(element);
		  	}
		}
	}
}