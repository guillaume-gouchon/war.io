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
			orderDispatcher.sendOrderToEngine(order.TYPES.cancelConstruction,
							 					[gameContent.selected[0].id]);
		} else if (gameContent.selected[0].family == gameData.FAMILIES.building) {
			orderDispatcher.sendOrderToEngine(order.TYPES.buy,
					 					[this.getSelectedElementsIds(), button]);
		}
	}
}


/**
*	The user wants to build a construction and chose which. 
* 	@param building : the building selected by the user
*/
userInput.enterConstructionMode = function (building) {
	gameContent.building = building;
	this.updateConstructionMode(input.mousePosition.x, input.mousePosition.y);
}


/**
* 	The user is moving the mouse while in the construction mode.
*		Makes move the building with the mouse and shows if it can be built here. 
* 	@param (x, y) : current coordinates of the mouse
*/
userInput.updateConstructionMode = function (x, y) {
	if(gameContent.building != null) {
		try {
			//updates building position
			gameContent.building.position = gameWindow.getAbsolutePositionFromPixel(x, y);
			
			//check if building can be built here
			gameContent.building.canBeBuiltHere = true;
			for(var i in gameContent.building.shape) {
				var row = gameContent.building.shape[i];
				for(var j in row) {
					var part = row[j];
					if(part > 0) {
						var position = tools.getPartPosition(gameContent.building, i, j);
						if(!gameContent.grid[position.x][position.y].isWall) {
							//this part is OK
							gameContent.building.shape[i][j] = 10;
						} else {
							//this part cannot be built here
							gameContent.building.shape[i][j] = 1;
							gameContent.building.canBeBuiltHere = false;
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
	gameContent.building = null;
	GUI.showBuildings = false;
}


/**
*	The user changes the zoom
*/
userInput.changeZoom = function (x, y, dz) {
	gameWindow.zoom += dz;
	gameWindow.zoom = Math.max(gameWindow.ZOOM_MIN, gameWindow.zoom);
	gameWindow.zoom = Math.min(gameWindow.ZOOM_MAX, gameWindow.zoom);

	var mousePosition = gameWindow.getAbsolutePositionFromPixel(x, y);
	gameWindow.updateGameWindowSize();
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
*	Updates mouse icon when scrolling
*/
userInput.updateMouseIcon = function (mouseX, mouseY) {
	var position = gameWindow.getAbsolutePositionFromPixel(mouseX, mouseY);
	var x = gameWindow.scroll.dx;
	var y =  - gameWindow.scroll.dy;
	if (tools.getElementUnder(position.x, position.y) != null) {
		GUI.updateMouse(GUI.MOUSE_ICONS.select);
	} else if (x > 0 && y > 0) {
		GUI.updateMouse(GUI.MOUSE_ICONS.arrowTopRight);
	} else if (x > 0 && y == 0) {
		GUI.updateMouse(GUI.MOUSE_ICONS.arrowRight);
	} else if (x > 0 && y < 0) {
		GUI.updateMouse(GUI.MOUSE_ICONS.arrowBottomRight);
	} else if (x < 0 && y > 0) {
		GUI.updateMouse(GUI.MOUSE_ICONS.arrowTopLeft);
	} else if (x < 0 && y == 0) {
		GUI.updateMouse(GUI.MOUSE_ICONS.arrowLeft);
	} else if (x < 0 && y < 0) {
		GUI.updateMouse(GUI.MOUSE_ICONS.arrowBottomLeft);
	} else if (x == 0 && y > 0) {
		GUI.updateMouse(GUI.MOUSE_ICONS.arrowTop);
	} else if (x == 0 && y < 0) {
		GUI.updateMouse(GUI.MOUSE_ICONS.arrowBottom);
	} else {
		GUI.updateMouse(GUI.MOUSE_ICONS.standard);
	}
}


/**
*	Scrolls the map by moving the mouse on the edge
*/
userInput.checkIfMapScrolling = function (x, y) {
	if (x < gameWindow.SCROLL_THRESHOLD) {
		gameWindow.updateHorizontalScrolling(-1);
	} else if(x > gameSurface.canvas.width - gameWindow.SCROLL_THRESHOLD) {
		gameWindow.updateHorizontalScrolling(1);
	} else {
		gameWindow.updateHorizontalScrolling(0);
	}

	if (y < gameWindow.SCROLL_THRESHOLD) {
		gameWindow.updateVerticalScrolling(1);
	} else if (y > gameSurface.canvas.height - gameWindow.SCROLL_THRESHOLD) {
		gameWindow.updateVerticalScrolling(-1);
	} else {
		gameWindow.updateVerticalScrolling(0);
	}

}

