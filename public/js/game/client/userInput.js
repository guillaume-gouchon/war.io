var userInput = {};


/**
*	CONSTANTS
*/
userInput.CAN_BE_BUILT_HERE = 10;
userInput.CANNOT_BE_BUILT_HERE = 1;
userInput.DOUBLE_CLICK_RADIUS_SIZE = 15;


/**
*	VARIABLES
*/
userInput.isChatWindowOpen = false;
userInput.hotKeysContent = [[], [], [], [], []];


userInput.doSelect = function (x, y, isCtrlKey, isShiftKey) {

	var clickedPart = GUI.isGUIClicked(x, y);
	if (clickedPart == GUI.GUI_ELEMENTS.bottomBar) {
		return;
	} else if (clickedPart == GUI.GUI_ELEMENTS.minimap) {
		GUI.clickOnMinimap(x, y);
		return;
	}

	// the user is building something
	if (gameContent.building != null) {

		this.tryBuildHere(isShiftKey);
		return false;

	} 

	//the user wants to select one or more elements
	else {

		this.leaveConstructionMode();

		if (!isCtrlKey) {
			// reset selected array
			gameSurface.unselectAll();
			gameContent.selected = [];	
		}
		
		// reset the selection rectangle
		gameContent.selectionRectangle = [];
		gameSurface.updateSelectionRectangle(-1, -1, -1, -1);

		gameContent.selectionRectangle[0] = x;
		gameContent.selectionRectangle[1] = y;

		var intersect = gameSurface.getFirstIntersectObject(x, y);
		if (intersect != null && intersect.elementId != null) {
			if (isCtrlKey && gameContent.selected.indexOf(intersect.object.elementId) > -1) {
				gameContent.selected.splice(gameContent.selected.indexOf(intersect.object.elementId), 1);
				gameSurface.unselectElement(intersect.object.elementId);
			} else {
				gameContent.selected.push(intersect.object.elementId);
				gameSurface.selectElement(intersect.object.elementId);
			}
		}

		if (gameContent.selected.length > 1) {
			for (var i in gameContent.selected) {
				var sId = '' + gameContent.selected[i];
				if (parseInt(sId.charAt(1)) == gameData.FAMILIES.land) {
					gameSurface.unselectElement(gameContent.selected[i]);
					gameContent.selected.splice(i, 1);
					break; 
				}
			}
		}

	  	return true;

	}
}


userInput.doAction = function (x, y, isShiftKey, specialOrder) {
	
	var clickedPart = GUI.isGUIClicked(x, y);
	if (clickedPart == GUI.GUI_ELEMENTS.bottomBar) {
		return;
	}

	// leave the construction mode if activated
	if(gameContent.building != null) {
		this.leaveConstructionMode();
	} else if(gameContent.selected.length > 0) {

		var selected = utils.getElementFromId(gameContent.selected[0]);
		if (rank.isAlly(gameContent.players, gameContent.myArmy, selected)
			&& (selected.f == gameData.FAMILIES.unit || selected.f == gameData.FAMILIES.building)) {

			var isFromMinimap = false;

			// minimap
			var clickedPart = GUI.isGUIClicked(x, y);
			if (clickedPart == GUI.GUI_ELEMENTS.minimap) {
				var convertedDestination = GUI.convertToMinimapPosition(x, y);
				x = convertedDestination.x;
				y = convertedDestination.y;
				isFromMinimap = true;
			}

			this.dispatchUnitAction(x, y, isShiftKey, specialOrder, isFromMinimap);
		}
	}

}


userInput.doDoubleClick = function (x, y) {

	if(gameContent.selected.length > 0) {

		var selected = utils.getElementFromId(gameContent.selected[0]);
		if(rank.isAlly(gameContent.players, gameContent.myArmy, selected)) {

			var tiles = tools.getTilesAround(gameContent.grid, selected.p, this.DOUBLE_CLICK_RADIUS_SIZE, true);
			for (var i in tiles) {
				if (tiles[i] > 0) {

					var element = utils.getElementFromId(tiles[i]);
					if(gameContent.selected.indexOf(element.id) == -1 && element.f == selected.f && rank.isAlly(gameContent.players, gameContent.myArmy, element) && element.t == selected.t) {

				  		// select the elements
				  		gameContent.selected.push(element.id);
			  	  		gameSurface.selectElement(element.id);

				  	}
				}
			}

		}

	}

}


userInput.pressToolbarShortcut = function (i) {
	// if(i < GUI.toolbar.length) {
	// 	this.clickOnToolbar(GUI.toolbar[i]);
	// }
}


userInput.pressEnterKey = function () {

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

userInput.pressSpaceKey = function () {
	if (gameContent.selected.length > 0) {
		gameSurface.centerCameraOnElement(utils.getElementFromId(gameContent.selected[0]));
	}
}


userInput.onMouseMove = function (x, y) {

	this.updateConstructionMode(x, y);
	this.updateMouseIcon(x, y);

}


userInput.onMouseUp = function () {

	this.removeSelectionRectangle();

}












/**
*	The user clicked on a button in the toolbar.
* 	@param button : the button that was clicked
*/
userInput.clickSpecialButton = function (buttonId) {

	soundManager.playSound(soundManager.SOUNDS_LIST.button);
	if (buttonId == gameData.BUTTONS.build.id) {
		// build something
		GUI.showBuildings = true;
	} else if (buttonId == gameData.BUTTONS.back.id) {
		// back button
		GUI.showBuildings = false;
	} else if (buttonId == gameData.BUTTONS.cancel.id) {
		// cancel construction
		gameManager.sendOrderToEngine(order.TYPES.cancelConstruction, [utils.getElementFromId(gameContent.selected[0]).id]);
	} else if (GUI.showBuildings) {
		// building
		var buildings = gameData.ELEMENTS[gameData.FAMILIES.building][gameContent.players[gameContent.myArmy].r];
		var building = buildings[Object.keys(buildings)[('' + buttonId)[2]]];
		this.enterConstructionMode(building);
	}  else if (utils.getElementFromId(gameContent.selected[0]).f == gameData.FAMILIES.building) {
		// buy unit / research
		var family = ('' + buttonId)[0];
		var elementBought;
		if (family == gameData.FAMILIES.unit) {
			// unit
			var units = gameData.ELEMENTS[gameData.FAMILIES.unit][gameContent.players[gameContent.myArmy].r];
			elementBought = units[Object.keys(units)[('' + buttonId)[2]]];
		} else {
			// research
			var researches = gameData.ELEMENTS[gameData.FAMILIES.research][gameContent.players[gameContent.myArmy].r];
			elementBought = researches[('' + buttonId).substring(2)];
		}
		
		gameManager.sendOrderToEngine(order.TYPES.buy, [gameContent.selected, elementBought]);
	}
	
}


/**
*	The user wants to build a construction and has chosen which one. 
* 	@param building : the building selected by the user
*/
userInput.enterConstructionMode = function (building) {
	gameContent.building = building;
	GUI.selectButton(building);
	this.updateConstructionMode(controls.mousePosition.x, controls.mousePosition.y);
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
*	The user does not want anymore to build the building selected.
*/
userInput.leaveConstructionMode = function () {
	gameContent.building = null;
	gameSurface.removeBuildingGeometry();
	GUI.unselectButtons();
	GUI.showBuildings = false;
}


/**
*	Updates the mouse icon.
*/
userInput.updateMouseIcon = function (mouseX, mouseY) {
	var elementUnder = gameSurface.getFirstIntersectObject(mouseX, mouseY);

	var x = - controls.scroll[0];
	var y = controls.scroll[1];
	
	if (elementUnder != null && elementUnder.elementId != null) {
		var e = utils.getElementFromId(elementUnder.elementId);
		if (controls.clickMode != controls.MODES.normal) {
			GUI.updateMouse(GUI.MOUSE_ICONS.crossHover);
			return;
		} else if (e != null && e.f != gameData.FAMILIES.land && rank.isEnemy(gameContent.players, gameContent.myArmy, e)) {
			GUI.updateMouse(GUI.MOUSE_ICONS.attack);
		} else {
			GUI.updateMouse(GUI.MOUSE_ICONS.select);
		}
	} else if (controls.clickMode != controls.MODES.normal) {
		GUI.updateMouse(GUI.MOUSE_ICONS.cross);
	} else if (!controls.isKeyboardScrolling) {
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


/**
*	The user wants to build his construction at the current position.
*/
userInput.tryBuildHere = function (isShiftKey) {
	if(gameContent.building.canBeBuiltHere) {
		soundManager.playSound(soundManager.SOUNDS_LIST.hammer);
		// let's start the construction
		gameManager.sendOrderToEngine(order.TYPES.buildThatHere,
							 [gameContent.selected, gameContent.building, 
							  gameContent.building.p.x, 
							  gameContent.building.p.y, isShiftKey]);
		if (!isShiftKey) {
			this.leaveConstructionMode();
		}
		
	} else {
		// cannot be built here !
	}
}


/**
*	Dispatches the action according to the order.
*/
userInput.dispatchUnitAction = function (x, y, isShiftKey, specialOrder, isFromMinimap) {
	var destination = null;
	if (isFromMinimap) {
		destination = {
			x : parseInt(x / gameSurface.PIXEL_BY_NODE),
			y : parseInt(y / gameSurface.PIXEL_BY_NODE)
		}
	} else {
		var elementUnder = gameSurface.getFirstIntersectObject(x, y);
		if (elementUnder != null) {
			if (elementUnder.object.elementId != null) {
				destination = utils.getElementFromId(elementUnder.object.elementId).p;
				gameSurface.animateSelectionCircle(elementUnder.object.elementId);
			} else {
				destination = {
					x : parseInt(elementUnder.point.x / gameSurface.PIXEL_BY_NODE),
					y : parseInt(elementUnder.point.y / gameSurface.PIXEL_BY_NODE)
				}
			}
		}
	}


	if (destination != null && destination.x >= 0 && destination.y >= 0 && destination.x < gameContent.map.size.x && destination.y < gameContent.map.size.y) {
		gameManager.sendOrderToEngine(order.TYPES.action, [gameContent.selected, destination.x, destination.y, isShiftKey, specialOrder]);
	}
	
}


/**
* 	The user is drawing a selection rectangle to select some elements.
* 	@param (x, y) : current coordinates of the mouse
*/
userInput.drawSelectionRectangle = function (x, y, isCtrlKey) {
	if(gameContent.selectionRectangle.length > 0) {

			// unselect the previous selected elements
			if (!isCtrlKey) {
				gameSurface.unselectAll();
				gameContent.selected = [];
			}

			var nonLandsSelected = false;


			gameSurface.updateSelectionRectangle(gameContent.selectionRectangle[0], gameContent.selectionRectangle[1], x, y);

			var position1 = gameSurface.getFirstIntersectObject(gameContent.selectionRectangle[0], gameContent.selectionRectangle[1]).point;
			var position2 = gameSurface.getFirstIntersectObject(x, y).point;

			var gamePosition1 = gameSurface.convertScenePositionToGamePosition(position1);
			var gamePosition2 = gameSurface.convertScenePositionToGamePosition(position2);
			var selectionRectangleGamePosition = [
				gamePosition1.x, gamePosition1.y, gamePosition2.x, gamePosition2.y
			];

			for (var i = Math.min(selectionRectangleGamePosition[0], selectionRectangleGamePosition[2]); i <= Math.max(selectionRectangleGamePosition[0], selectionRectangleGamePosition[2]); i++) {
				for (var j = Math.min(selectionRectangleGamePosition[1], selectionRectangleGamePosition[3]); j <= Math.max(selectionRectangleGamePosition[1], selectionRectangleGamePosition[3]); j++) {
					if (gameContent.grid[i][j] > 0) {
						var element = utils.getElementFromId(gameContent.grid[i][j]);
						if(rank.isAlly(gameContent.players, gameContent.myArmy, element)) {

							if (!isCtrlKey || gameContent.selected.indexOf(element.id) == -1) {
						  		// select the elements
						  		gameContent.selected.push(element.id);
					  	  		gameSurface.selectElement(element.id);
					  	  		nonLandsSelected = true;
				  	  		}

					  	}
					}
				}
			}

			// unselect the buildings if one or more units are selected
			for (var i in gameContent.selected) {
				var sId = '' + gameContent.selected[i];
				if (sId.charAt(1) == gameData.FAMILIES.unit) {
					
					var len = gameContent.selected.length;
					while(len--) {
						var element = utils.getElementFromId(gameContent.selected[len]);
						if(element.f == gameData.FAMILIES.building) {
							gameContent.selected.splice(len, 1);
					  		gameSurface.unselectElement(element.id);
						}
					}

					break;
				}
			}

			// unselect the lands if one or more elements are selected
			if (nonLandsSelected) {
				var len = gameContent.selected.length;
				while(len--) {
					var element = utils.getElementFromId(gameContent.selected[len]);
					if(element.f == gameData.FAMILIES.land) {
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


userInput.pressStopKey = function () {
	if (gameContent.selected.length > 0) {
		gameManager.sendOrderToEngine(order.TYPES.stop, [gameContent.selected]);
	}
}


userInput.pressHoldKey = function () {
	if (gameContent.selected.length > 0) {
		gameManager.sendOrderToEngine(order.TYPES.hold, [gameContent.selected]);
	}
}


userInput.enterPatrolMode = function () {
	if (gameContent.selected.length > 0) {
		GUI.unselectButtons();
		$('#patrolButton').addClass('selected');
		controls.clickMode = controls.MODES.patrol;
	}
}


userInput.enterAttackMode = function () {
	if (gameContent.selected.length > 0) {
		GUI.unselectButtons();
		$('#attackButton').addClass('selected');
		controls.clickMode = controls.MODES.attack;	
	}
}


userInput.leaveSpecialClickMode = function () {
	GUI.unselectButtons();
	GUI.updateMouse(GUI.MOUSE_ICONS.standard);
	controls.clickMode = controls.MODES.normal;
}


userInput.pressHotKey = function (index, isCtrlKey) {

	if (isCtrlKey) {

		this.hotKeysContent[index] = [];
		for (var i in gameContent.selected) {
			this.hotKeysContent[index].push(gameContent.selected[i]);	
		}
		

	} else {

		var n = this.hotKeysContent[index].length;
		if (n == 0) { return; }

		while (n--) {
			if (utils.getElementFromId(this.hotKeysContent[index][n]) == null) {
				this.hotKeysContent[index].splice(n, 1);
			}
		}

		if (gameContent.selected.length == this.hotKeysContent[index].length 
			&& this.hotKeysContent[index].indexOf(gameContent.selected[0]) > -1) {
			gameSurface.centerCameraOnElement(utils.getElementFromId(gameContent.selected[0]));
		}

		gameSurface.unselectAll();
		gameContent.selected = [];
		for (var i in this.hotKeysContent[index]) {
			gameContent.selected.push(this.hotKeysContent[index][i]);
			gameSurface.selectElement(this.hotKeysContent[index][i]);
		}

	}

}


/**
*	The user cancelled an unit or a research.
*/
userInput.cancelQueue = function (buttonId) {
	gameManager.sendOrderToEngine(order.TYPES.cancelQueue, [gameContent.selected[0], buttonId]);
}
