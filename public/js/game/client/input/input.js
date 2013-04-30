var input = {};


/**
*	Initializes the different inputs methods.
*/
input.initInputs = function () {
	if (this.isTouchDevice()) {
		this.initTouch();
	} else {
		this.initMouse();
		this.initKeyboard();	
	}
}


 /**
 *	Checks if user's device is touch-enabled.
 */
input.isTouchDevice = function () {
    return "ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch;
}


/**
*	Stores the mouse position.
*/	
input.mousePosition = {
	x : 0,
	y : 0
}


/**
*	Binds the different needed mouse inputs.
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

	document.onmousewheel = function (event) {
		return inputDispatcher.onMouseWheel(event);
	}

	document.ondblclick = function (event) {
		return inputDispatcher.onDoubleClick(event);
	}

	document.onmouseup = function (event) {
		return inputDispatcher.onMouseUp(event);
	}

}


/**
*	Binds the different needed keyboard inputs.
*/
input.initKeyboard = function () {
	
	document.onkeydown = function (event) {
  		return inputDispatcher.onKeyDown(event);
	}

	document.onkeyup = function (event) {
  		return inputDispatcher.onKeyUp(event);
	}

}


/**
*	Binds the different needed touch inputs.
*/
input.initTouch = function () {

	$(document).hammer().on('tap', function (event) {
		console.log(event);
	  	inputDispatcher.onLeftClick(event);
	});

	$(document).hammer().on('doubletap', function (event) {
		console.log(event);
	  	inputDispatcher.onRightClick(event);
	});

	/*document.ontouchmove = function (event) {
		userInput.checkIfMapScrolling(event.x, event.y);
		userInput.updateMouseIcon(event.x, event.y);
		userInput.selectGroup(event.x, event.y);
		if (Math.abs(event.x - input.mousePosition.x) + Math.abs(event.y - input.mousePosition.y) > 3) {
			inputDispatcher.onMouseMove(event); 
		}
		input.mousePosition.x = event.x;
		input.mousePosition.y = event.y;
		return false;
	}*/

	/*$$(window).bind('swipetwo', function(event){
		console.log(event)
	});*/

	$(document).hammer().on('drag', function(event){
		console.log(event);
	});

	$(document).hammer().on('pinch', function (event) {
		console.log(event);
		//return inputDispatcher.onMouseWheel(event);
	});

	$(document).hammer().on('hold', function (event) {
		console.log(event);
		//return inputDispatcher.onDoubleClick(event);
	});

	$(document).hammer().on('release', function (event) {
  		inputDispatcher.onMouseUp(event);
	});

}