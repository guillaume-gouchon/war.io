/**
*	Single left click
*/
input.onLeftClick = function (event) {
	if(event.which == 1) {
		var x = event.x;
		var y = event.y;
		//the user clicked on a toolbar's button
		if(GUI.toolbar.length > 0 && y > gameSurface.height - GUI.TOOLBAR_HEIGHT 
			&& x / (GUI.BUTTONS_WIDTH + GUI.BUTTONS_SPACE) < GUI.toolbar.length 
			&& x % (GUI.BUTTONS_WIDTH + GUI.BUTTONS_SPACE) > GUI.BUTTONS_SPACE) {
				userInput.clickOnToolbar(GUI.toolbar[parseInt(x / (GUI.BUTTONS_WIDTH + GUI.BUTTONS_SPACE))]);
				return false;
		}
		//the user is building something
		else if(gameContent.building != null) {
			userInput.tryBuildHere();
			return false;
		} 
		//the user wants to select one or more elements
		else {
			userInput.clickToSelect(x, y);
		  return true;
		}
	}
}


/**
*	Left double click
*/
input.onDoubleClick = function (event) {
	if(event.which == 1) {
		var x = event.x;
		var y = event.y;
		userInput.doubleClickToSelect(x, y);
	}
	return false;
}


/**
*	Single right click
*/
input.onRightClick = function (event) {
	//leave the construction mode if activated
	if(gameContent.building != null) {
		userInput.leaveConstructionMode();
	} else if(gameContent.selected.length > 0 
		&& rank.isAlly(gameContent.myArmy, gameContent.gameElements[gameContent.selected[0]].s)
		&& (gameContent.gameElements[gameContent.selected[0]].s.f == gameData.FAMILIES.unit
			|| gameContent.gameElements[gameContent.selected[0]].s.f == gameData.FAMILIES.building)) {
			userInput.dispatchUnitAction(event.x, event.y); 
	}
	return false;
}


/**
*	The mouse is moving
*/
input.onMouseMove = function (event) {
	userInput.selectGroup(event.x, event.y);
	userInput.updateConstructionMode(event.x, event.y);
	userInput.checkIfMapScrolling(event.x, event.y);
	userInput.updateMouseIcon(event.x, event.y);
}


/**
*	The mouse click has been released
*/
input.onMouseUp = function () {
	userInput.removeSelectionRectangle();
}


/**
*	The mouse wheel is scrolling
*/
input.onMouseWheel = function (event) {
	if(Math.abs(event.wheelDelta) > 0) {
		userInput.changeZoom(event.wheelDelta / Math.abs(event.wheelDelta));
	}
	return false;
}


/**
*	A keyboard's key is being pressed
*/
input.onKeyDown = function (event) {
	//map navigation
	var keyCode = (window.event) ? event.which : event.keyCode;
	switch(keyCode) {
		case 38 :
			gameSurface.updateVerticalScrolling(1);
			event.preventDefault();
			return true;
			break;
		case 40 :
			gameSurface.updateVerticalScrolling(-1);
			event.preventDefault();
			return true;
			break;
		case 39 :
			gameSurface.updateHorizontalScrolling(1);
			return true;
			break;
		case 37 :
			gameSurface.updateHorizontalScrolling(-1);
			event.preventDefault();
			return true;
			break;
	}

	//toolbar's keyboard shortcuts
	for(var i in input.TOOLBAR_KEYBOARD_SHORTCUTS) {
		var shortcut = input.TOOLBAR_KEYBOARD_SHORTCUTS[i];
		if(shortcut == keyCode) {
			userInput.pressToolbarShortcut(i);
			return false;
		}
	}

	return true;
}


/**
*	A keyboard's key has ben released
*/
input.onKeyUp = function (event) {
	//map navigation
	var keyCode = (window.event) ? event.which : event.keyCode;
	switch(keyCode) {
		case 38 :
			gameSurface.updateVerticalScrolling(0);
			return false;
			break;
		case 40 :
			gameSurface.updateVerticalScrolling(0);
			return false;
			break;
		case 39 :
			gameSurface.updateHorizontalScrolling(0);
			return false;
			break;
		case 37 :
			gameSurface.updateHorizontalScrolling(0);
			return false;
			break;
	}
}
