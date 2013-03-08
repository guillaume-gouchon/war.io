/**
*	Distributes the input events to the logic system
*/
var inputDispatcher = {};


/**
*	CONSTANTS
*/
inputDispatcher.TOOLBAR_KEYBOARD_SHORTCUTS = [81, 87, 69, 82, 65, 83, 68, 70];


/**
*	VARIABLES
*/
inputDispatcher.mousePosition = {
	x : 0,
	y : 0
}


/**
*	Single left click
*/
inputDispatcher.onLeftClick = function (event) {
	if(event.which == 1) {
		var x = event.x;
		var y = event.y;
		//the user clicked on a toolbar's button
		if(GUI.toolbar.length > 0 && y > gameSurface.canvas.height - GUI.TOOLBAR_HEIGHT 
			&& x / (GUI.BUTTONS_WIDTH + GUI.BUTTONS_SPACE) < GUI.toolbar.length 
			&& x % (GUI.BUTTONS_WIDTH + GUI.BUTTONS_SPACE) > GUI.BUTTONS_SPACE) {
				userInput.clickOnToolbar(GUI.toolbar[parseInt(x / (GUI.BUTTONS_WIDTH + GUI.BUTTONS_SPACE))]);
				return false;
		}
		//the user is building something
		else if(gameLogic.building != null) {
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
*	Single right click
*/
inputDispatcher.onRightClick = function (event) {
	//leave the construction mode if activated
	if(gameLogic.building != null) {
		userInput.leaveConstructionMode();
	} else if(gameLogic.selected.length > 0) {
		//give order to units
		if(gameLogic.selected[0].family == gameData.FAMILIES.unit) {
			userInput.dispatchUnitAction(event.x, event.y);
		} 
		//change buildings' rallying point
		else if(gameLogic.selected[0].family == gameData.FAMILIES.building) {
			userInput.changeRallyingPoint(event.x, event.y);
		}
	}
	return false;
}


/**
*	The mouse is moving
*/
inputDispatcher.onMouseMove = function (event) {
	userInput.selectGroup(event.x, event.y);
	userInput.updateConstructionMode(event.x, event.y);
	userInput.checkIfMapScrolling(event.x, event.y);
	this.mousePosition = {x : event.x, y : event.y};
}


/**
*	The mouse click has been released
*/
inputDispatcher.onMouseUp = function () {
	userInput.removeSelectionRectangle();
}


/**
*	The mouse wheel is scrolling
*/
inputDispatcher.onMouseWheel = function (event) {
	if(Math.abs(event.wheelDelta) > 0) {
		userInput.changeZoom(event.clientX, event.clientY, event.wheelDelta / Math.abs(event.wheelDelta));
	}
	return false;
}


/**
*	A keyboard's key is being pressed
*/
inputDispatcher.onKeyDown = function (event) {
	//map navigation
	switch(event.keyCode) {
		case 38 :
			userInput.updateVerticalScrolling(1);
			event.preventDefault();
			return true;
			break;
		case 40 :
			userInput.updateVerticalScrolling(-1);
			event.preventDefault();
			return true;
			break;
		case 39 :
			userInput.updateHorizontalScrolling(1);
			return true;
			break;
		case 37 :
			userInput.updateHorizontalScrolling(-1);
			event.preventDefault();
			return true;
			break;
	}

	//toolbar's keyboard shortcuts
	for(var i in this.TOOLBAR_KEYBOARD_SHORTCUTS) {
		var shortcut = this.TOOLBAR_KEYBOARD_SHORTCUTS[i];
		if(shortcut == event.keyCode) {
			userInput.pressToolbarShortcut(i);
			return false;
		}
	}

	return true;
}


/**
*	A keyboard's key has ben released
*/
inputDispatcher.onKeyUp = function (event) {
	//map navigation
	switch(event.keyCode) {
		case 38 :
			userInput.updateVerticalScrolling(0);
			return false;
			break;
		case 40 :
			userInput.updateVerticalScrolling(0);
			return false;
			break;
		case 39 :
			userInput.updateHorizontalScrolling(0);
			return false;
			break;
		case 37 :
			userInput.updateHorizontalScrolling(0);
			return false;
			break;
	}
}
