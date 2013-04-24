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
	  return inputDispatcher.onLeftClick(event);
	}

	document.oncontextmenu = function (event) {
	  return inputDispatcher.onRightClick(event);
	}

	document.onmousemove = function (event) {
		userInput.checkIfMapScrolling(event.x, event.y);
		userInput.updateMouseIcon(event.x, event.y);
		userInput.selectGroup(event.x, event.y);
		if (Math.abs(event.x - input.mousePosition.x) + Math.abs(event.y - input.mousePosition.y) > 3) {
			inputDispatcher.onMouseMove(event); 
		}
		input.mousePosition.x = event.x;
		input.mousePosition.y = event.y;
		return false;
	}

	document.onmouseup = function (event) {
	  return inputDispatcher.onMouseUp(event);
	}

	document.onmousewheel = function (event) {
	  return inputDispatcher.onMouseWheel(event);
	}

	document.ondblclick = function (event) {
		return inputDispatcher.onDoubleClick(event);
	}

}




/**
*	Binds the different keyboard inputs needed to the events
*/
input.initKeyboard = function () {
	
	document.onkeydown = function (event) {
  		return inputDispatcher.onKeyDown(event);
	}

	document.onkeyup = function (event) {
  		return inputDispatcher.onKeyUp(event);
	}

}
