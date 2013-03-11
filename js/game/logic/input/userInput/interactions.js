/**
*	CONSTANTS
*/
userInput.MAP_SCROLL_SPEED = 5;
userInput.SCROLL_THRESHOLD = 30;


/**
*	The user clicked on a button in the toolbar.
* 	@param button : the button that was clicked
*/
userInput.clickOnToolbar = function (button) {
	if (button.isEnabled) {
		if (button == GUI.TOOLBAR_BUTTONS.build) {
			//build something
			GUI.showBuildings = true;
		} else if (button.constructionColors != null && button.isEnabled) {
			//building
			this.enterConstructionMode(button);
		} else if (button == GUI.TOOLBAR_BUTTONS.cancel) {
			//cancel construction
			buildLogic.cancelConstruction(gameLogic.selected);
		} else if (button.speed != null) {
			//unit
			buildLogic.buyElement(button);
		} else {
			//skill
		}
	}
}


/**
*	The user wants to build a construction and chose which. 
* 	@param building : the building selected by the user
*/
userInput.enterConstructionMode = function (building) {
	gameLogic.building = building;
	this.updateConstructionMode(inputDispatcher.mousePosition.x, inputDispatcher.mousePosition.y);
}


/**
* 	The user is moving the mouse while in the construction mode.
*		Makes move the building with the mouse and shows if it can be built here. 
* 	@param (x, y) : current coordinates of the mouse
*/
userInput.updateConstructionMode = function (x, y) {
	if(gameLogic.building != null) {
		try {
			//updates building position
			gameLogic.building.position = gameSurface.getAbsolutePositionFromPixel(x, y);
			
			//check if building can be built here
			gameLogic.building.canBeBuiltHere = true;
			for(var i in gameLogic.building.shape) {
				var row = gameLogic.building.shape[i];
				for(var j in row) {
					var part = row[j];
					if(part > 0) {
						var position = tools.getPartPosition(gameLogic.building, i, j);
						if(!gameLogic.grid[position.x][position.y].isWall) {
							//this part is OK
							gameLogic.building.shape[i][j] = buildLogic.STATUS_CAN_BUILD_HERE;
						} else {
							//this part cannot be built here
							gameLogic.building.shape[i][j] = buildLogic.STATUS_CANNOT_BUILD_HERE;
							gameLogic.building.canBeBuiltHere = false;
						}
					}
				}
			}
		} catch (e) {
		}
	}
}


/**
*		The user does not want anymore to build the building selected.
*/
userInput.leaveConstructionMode = function () {
	gameLogic.building = null;
	GUI.showBuildings = false;
}


/**
*	The user changes the zoom
*/
userInput.changeZoom = function (x, y, dz) {
	gameLogic.zoom += dz;
	gameLogic.zoom = Math.max(gameLogic.ZOOM_MIN, gameLogic.zoom);
	gameLogic.zoom = Math.min(gameLogic.ZOOM_MAX, gameLogic.zoom);

	var mousePosition = gameSurface.getAbsolutePositionFromPixel(x, y);
	gameSurface.updateGameWindowSize();
	if(dz > 0) {
		/*gameSurface.moveGameWindowPositionTo(mousePosition.x - parseInt(gameSurface.window.width / 2), 
										 	 mousePosition.y - parseInt(gameSurface.window.height / 2));*/
	}
}


/**
*	Toolbar's keyboard shortcuts
*/
userInput.pressToolbarShortcut = function (i) {
	if(i < GUI.toolbar.length) {
		this.clickOnToolbar(GUI.toolbar[i]);
	}
}


/**
*	Map navigation
*/
userInput.updateHorizontalScrolling = function (x) {
	gameSurface.scroll.dx = x * this.MAP_SCROLL_SPEED;
}
userInput.updateVerticalScrolling = function (y) {
	gameSurface.scroll.dy = - y * this.MAP_SCROLL_SPEED;
}
userInput.stopMapScrolling = function () {
	userInput.updateHorizontalScrolling(0);
	userInput.updateVerticalScrolling(0);
}


/**
*	Updates mouse icon when scrolling
*/
userInput.updateMouseIcon = function (mouseX, mouseY) {
	var position = gameSurface.getAbsolutePositionFromPixel(mouseX, mouseY);
	var x = gameSurface.scroll.dx;
	var y =  - gameSurface.scroll.dy;
	if (x > 0 && y > 0) {
		display.updateMouse(display.MOUSE_ICONS.arrowTopRight);
	} else if (x > 0 && y == 0) {
		display.updateMouse(display.MOUSE_ICONS.arrowRight);
	} else if (x > 0 && y < 0) {
		display.updateMouse(display.MOUSE_ICONS.arrowBottomRight);
	} else if (x < 0 && y > 0) {
		display.updateMouse(display.MOUSE_ICONS.arrowTopLeft);
	} else if (x < 0 && y == 0) {
		display.updateMouse(display.MOUSE_ICONS.arrowLeft);
	} else if (x < 0 && y < 0) {
		display.updateMouse(display.MOUSE_ICONS.arrowBottomLeft);
	} else if (x == 0 && y > 0) {
		display.updateMouse(display.MOUSE_ICONS.arrowTop);
	} else if (x == 0 && y < 0) {
		display.updateMouse(display.MOUSE_ICONS.arrowBottom);
	} else if (tools.getElementUnder(position.x, position.y) != null) {
		display.updateMouse(display.MOUSE_ICONS.select);
	} else {
		display.updateMouse(display.MOUSE_ICONS.default);
	}
}


/**
*	Scrolls the map by moving the mouse on the edge
*/
userInput.checkIfMapScrolling = function (x, y) {
	if (x < this.SCROLL_THRESHOLD) {
		userInput.updateHorizontalScrolling(-1);
	} else if(x > gameSurface.canvas.width - this.SCROLL_THRESHOLD) {
		userInput.updateHorizontalScrolling(1);
	} else {
		userInput.updateHorizontalScrolling(0);
	}

	if (y < this.SCROLL_THRESHOLD) {
		userInput.updateVerticalScrolling(1);
	} else if (y > gameSurface.canvas.height - this.SCROLL_THRESHOLD) {
		userInput.updateVerticalScrolling(-1);
	} else {
		userInput.updateVerticalScrolling(0);
	}

}

