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
	gameContent.selectionRectangle = [];
	gameContent.selectionRectangle[0] = x;
	gameContent.selectionRectangle[1] = y;

	//reset selected array
	gameContent.selected = [];

	var position = gameWindow.getAbsolutePositionFromPixel(x, y);


	for(var i in gameContent.gameElements) {
		var element = gameContent.gameElements[i];
	  	if(tools.isElementThere(element, {x : position.x, y : position.y})) {
	  		//select the clicked element
	  		element.isSelected = true;
	  		gameContent.selected.push(element);
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
	if(gameContent.selectionRectangle.length > 0 
		&& Math.abs(x - gameContent.selectionRectangle[0]) > this.SELECTION_RECTANGLE_THRESHOLD
		&& Math.abs(y - gameContent.selectionRectangle[1]) > this.SELECTION_RECTANGLE_THRESHOLD) {
			GUI.updateMouse(GUI.MOUSE_ICONS.select);

			//get the last coordinates of the selection rectangle
			gameContent.selectionRectangle[2] = x - gameContent.selectionRectangle[0];
			gameContent.selectionRectangle[3] = y - gameContent.selectionRectangle[1];

			//unselect the previous selected elements
			gameContent.selected = [];

			var unitSelected = false;

			var rectangleOrigin = gameWindow.getAbsolutePositionFromPixel(gameContent.selectionRectangle[0], gameContent.selectionRectangle[1]);
			var rectangleSize = {
				width : parseInt(gameContent.selectionRectangle[2] / gameWindow.PIXEL_BY_NODE),
				height : parseInt(gameContent.selectionRectangle[3] / gameWindow.PIXEL_BY_NODE)
			};

			for(var i in gameContent.gameElements) {
				var element = gameContent.gameElements[i];
	  			if(rank.isAlly(gameManager.myArmy, element)
	  				&& element.f != gameData.FAMILIES.terrain
	  				&& (gameContent.selectionRectangle[2] > 0 
			  		&& element.p.x <= rectangleOrigin.x + rectangleSize.width
			  		&& element.p.x >= rectangleOrigin.x
			  		|| element.p.x >= rectangleOrigin.x + rectangleSize.width
			  		&& element.p.x <= rectangleOrigin.x)
			  		&& (gameContent.selectionRectangle[3] > 0 
			  		&& element.p.y <= rectangleOrigin.y + rectangleSize.height
			  		&& element.p.y >= rectangleOrigin.y
			  		|| element.p.y >= rectangleOrigin.y + rectangleSize.height
			  		&& element.p.y <= rectangleOrigin.y)) {
				  		//select the elements in the rectangle
				  		element.isSelected = true;
				  		gameContent.selected.push(element);
				  		if(element.f == gameData.FAMILIES.unit) {
				  			unitSelected = true;
				  		}
			  	} else {
				  		//unselect the others
				  		element.isSelected = false;
			  	}
			}

			//unselect the buildings if one or more units are selected
			if(unitSelected) {
				var len = gameContent.selected.length;
				while(len--) {
					var element = gameContent.selected[len];
					if(element.f == gameData.FAMILIES.building) {
						element.isSelected = false;
						gameContent.selected.splice(len, 1);
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
}


/**
*	Selects all similar ally units.
*/
userInput.doubleClickToSelect = function (x, y) {
	if(gameContent.selected.length > 0 && rank.isAlly(gameManager.myArmy, gameContent.selected[0])) {
		var selected = gameContent.selected[0];
		for(var i in gameContent.gameElements) {
			var element = gameContent.gameElements[i];
		  	if(element.f == selected.f && rank.isAlly(gameManager.myArmy, element)
		  		&& element.t == selected.t) {
		  		//select the clicked element
		  		element.isSelected = true;
		  		gameContent.selected.push(element);
		  	}
		}
	}
}