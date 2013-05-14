var userInput = {};


/**
*	CONSTANTS
*/
userInput.CAN_BE_BUILT_HERE = 10;
userInput.CANNOT_BE_BUILT_HERE = 1;


/**
*	VARIABLES
*/
userInput.isChatWindowOpen = false;


/**
*	The user clicked on a button in the toolbar.
* 	@param button : the button that was clicked
*/
userInput.clickOnToolbar = function (button) {
	if (button.isEnabled) {
		soundManager.playSound(soundManager.SOUNDS_LIST.button);
		if (button.buttonId == GUI.TOOLBAR_BUTTONS.build.buttonId) {
			//build something
			GUI.showBuildings = true;
		} else if (GUI.showBuildings && button.isEnabled) {
			//building
			this.enterConstructionMode(button);
		} else if (button.buttonId == GUI.TOOLBAR_BUTTONS.cancel.buttonId) {
			//cancel construction
			gameManager.sendOrderToEngine(order.TYPES.cancelConstruction, [gameContent.gameElements[gameContent.selected[0]].s.id]);
		} else if (gameContent.gameElements[gameContent.selected[0]].s.f == gameData.FAMILIES.building) {
			gameManager.sendOrderToEngine(order.TYPES.buy,
					 					[gameContent.selected, button]);
		}
	}
}


/**
*	The user wants to build a construction and has chosen which one. 
* 	@param building : the building selected by the user
*/
userInput.enterConstructionMode = function (building) {
	gameContent.building = building;
	GUI.selectButton(building);
	this.updateConstructionMode(input.mousePosition.x, input.mousePosition.y);
}


/**
* 	The user is moving the mouse while in the construction mode.
*		Makes move the building with the mouse and shows if it can be built here. 
* 	@param (x, y) : current coordinates of the mouse
*/
userInput.updateConstructionMode = function (x, y) {
	if(gameContent.building != null) {
		//updates building position
		gameContent.building.p = gameSurface.getAbsolutePositionFromPixel(x, y);

		//check if building can be built here
		gameContent.building.canBeBuiltHere = true;
		for(var i in gameContent.building.shape) {
			for(var j in gameContent.building.shape[i]) {
				gameContent.building.shape[i][j] = this.CAN_BE_BUILT_HERE;
			}
		}
		utils.canBeBuiltHere(gameContent.building);
		gameSurface.updateBuildingGeometry();
	}
}


/**
*		The user does not want anymore to build the building selected.
*/
userInput.leaveConstructionMode = function () {
	gameContent.building = null;
	gameSurface.removeBuildingGeometry();
	GUI.unselectButtons();
	GUI.showBuildings = false;
}


/**
*	The user changes the zoom
*/
userInput.changeZoom = function (dz) {
	gameSurface.updateZoom(dz);
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
*	Updates mouse icon.
*/
userInput.updateMouseIcon = function (mouseX, mouseY) {
	var elementUnder = gameSurface.getFirstIntersectObject(mouseX, mouseY);
	var x = gameSurface.scroll[0];
	var y = gameSurface.scroll[1];
	
	if (elementUnder != null && elementUnder.object.elementId != null) {
		var e = gameContent.gameElements[elementUnder.object.elementId].s;
		if (e != null && e.f != gameData.FAMILIES.land && rank.isEnemy(gameContent.players, gameContent.myArmy, e)) {
			GUI.updateMouse(GUI.MOUSE_ICONS.attack);
		} else {
			GUI.updateMouse(GUI.MOUSE_ICONS.select);
		}
	} else if (!gameSurface.isKeyboardScrolling) {
		if (x > 0 && y > 0) {
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
}


userInput.SCROLL_THRESHOLD = 10;


/**
*	Scrolls the map by moving the mouse on an edge.
*/
userInput.checkIfMapScrolling = function (x, y) {
	if (x < this.SCROLL_THRESHOLD) {
		gameSurface.updateScrolling(0, -1, false);
	} else if(x > window.innerWidth - this.SCROLL_THRESHOLD) {
		gameSurface.updateScrolling(0, 1, false);
	} else if (!gameSurface.isKeyboardScrolling && gameSurface.scroll[0] != 0) {
		gameSurface.updateScrolling(0, 0, false);
	}

	if (y < this.SCROLL_THRESHOLD) {
		gameSurface.updateScrolling(1, 1, false);
	} else if (y > window.innerHeight - this.SCROLL_THRESHOLD) {
		gameSurface.updateScrolling(1, -1, false);
	} else if (!gameSurface.isKeyboardScrolling && gameSurface.scroll[1] != 0) {
		gameSurface.updateScrolling(1, 0, false);
	}

}


/**
*	The user wants to build his construction at the current position.
*/
userInput.tryBuildHere = function () {
	if(gameContent.building.canBeBuiltHere) {
		soundManager.playSound(soundManager.SOUNDS_LIST.hammer);
		//let's start the construction
		gameManager.sendOrderToEngine(order.TYPES.buildThatHere,
							 [gameContent.selected, gameContent.building, 
							  gameContent.building.p.x, 
							  gameContent.building.p.y]);
		this.leaveConstructionMode();
	} else {
		//cannot be built here !
	}
}


/**
*	Dispatches the action according to the order.
*/
userInput.dispatchUnitAction = function (x, y) {
	var destination;
	var elementUnder = gameSurface.getFirstIntersectObject(x, y);
	if (elementUnder != null) {
		if (elementUnder.object.elementId != null) {
			destination = gameContent.gameElements[elementUnder.object.elementId].s.p;
			gameSurface.animateSelectionCircle(elementUnder.object.elementId);
		} else {
			destination = {
				x : parseInt(elementUnder.point.x / gameSurface.PIXEL_BY_NODE),
				y : parseInt(elementUnder.point.y / gameSurface.PIXEL_BY_NODE)
			}
		}
		this.sendOrder(destination.x, destination.y);
	}
}


/**
*	Send order to the engine.
*/
userInput.sendOrder = function (x, y) {
	if (x >= 0 && y >= 0
		&& x < gameContent.map.size.x && y < gameContent.map.size.y) {
		gameManager.sendOrderToEngine(order.TYPES.action, [gameContent.selected, x, y]);
	}
}


/**
*	Manages chat entries.
*/
userInput.onEnterKey = function () {
	if (this.isChatWindowOpen) {
		$('#chat').addClass('hide');
		var message = $('input', '#chat').val();
		if (message != '') {
			if (message == 'olivier !' || message == '/soundon') {
				gameManager.musicEnabled = true;
				soundManager.playMusic();
				gameSurface.showMessage(gameSurface.MESSAGES.musicEnabled);
			} else if (message == 'paranormalement' || message == '/soundoff') {
				gameManager.musicEnabled = false;
				soundManager.stopMusic();
				gameSurface.showMessage(gameSurface.MESSAGES.musicDisabled);
			} else if (message == '/surrender') {
				gameManager.sendOrderToEngine(order.TYPES.surrender, [gameContent.myArmy]);
			} else {
				gameManager.sendOrderToEngine(order.TYPES.chat, [gameContent.myArmy, $('input', '#chat').val()]);
			}
		}
		$('input', '#chat').val('');
	} else {
		$('#chat').removeClass('hide');
		$('#chat').css('top', (window.innerHeight - $('#chat').height()) / 2);
		$('#chat').css('left', (window.innerWidth - $('#chat').width()) / 2);
        $('input', '#chat')[0].focus();
	}
	this.isChatWindowOpen = !this.isChatWindowOpen;
}
