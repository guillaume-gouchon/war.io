var input = {};


/**
*	Initializes the different inputs methods.
*/
input.initInputs = function () {
	this.initMouse();
	this.initKeyboard();
}


/**
*	Stores the mouse position.
*/	
input.mousePosition = {
	x : 0,
	y : 0
}


/**
*	Binds the different mouse inputs needed to the events
*/
input.initMouse = function () {

	document.onmousedown = function (event) {
	  return input.onLeftClick(event);
	}

	document.oncontextmenu = function (event) {
	  return input.onRightClick(event);
	}

	document.onmousemove = function (event) {
		userInput.checkIfMapScrolling(event.x, event.y);
		userInput.updateMouseIcon(event.x, event.y);
		if (Math.abs(event.x - input.mousePosition.x) + Math.abs(event.y - input.mousePosition.y) > 3) {
			input.mousePosition.x = event.x;
			input.mousePosition.y = event.y;
			return input.onMouseMove(event); 
		} else {
			input.mousePosition.x = event.x;
			input.mousePosition.y = event.y;
			return false;
		}
	}

	document.onmouseup = function (event) {
	  return input.onMouseUp(event);
	}

	document.onmousewheel = function (event) {
	  return input.onMouseWheel(event);
	}

	document.ondblclick = function (event) {
		return input.onDoubleClick(event);
	}

}


/**
*	Stores the list of shortcuts keys.
*/
input.TOOLBAR_KEYBOARD_SHORTCUTS = [81, 87, 69, 82, 65, 83, 68, 70];


/**
*	Binds the different keyboard inputs needed to the events
*/
input.initKeyboard = function () {
	
	document.onkeydown = function (event) {
  		return input.onKeyDown(event);
	}

	document.onkeyup = function (event) {
	  	return input.onKeyUp(event);
	}

}
