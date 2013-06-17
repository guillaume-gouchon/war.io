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
		userInput.selectGroup(event.x, event.y);
		userInput.checkIfMapScrolling(event.x, event.y);
		userInput.updateMouseIcon(event.x, event.y);
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
*	TOUCH CONSTANTS
*/
input.DOUBLE_TAP_INTERVAL = 150;
input.DRAG_FACTOR = 1 / 35;


/**
*	TOUCH VARIABLES
*/
input.isSelectionRectangle = false;


/**
*	Binds the different needed touch inputs.
*/
input.initTouch = function () {

	var hammerOptions = {
        tap_always: false,
        hold_timeout: 250
    };

    //fixes the mouse position in the center of the screen (used only for building construction)
    input.mousePosition.x = window.innerWidth / 2;
	input.mousePosition.y = window.innerHeight / 2;

	$(document).hammer(hammerOptions).on('tap', function (event) {
		var e = {
			x: event.gesture.center.pageX,
			y: event.gesture.center.pageY,
			which: 1
		};
  		inputDispatcher.onLeftClick(e);	
	});

	$(document).hammer(hammerOptions).on('hold', function (event) {
		var e = {
			x: event.gesture.center.pageX,
			y: event.gesture.center.pageY,
			which: 1
		};
		inputDispatcher.onRightClick(e);
		input.isSelectionRectangle = true;
	});

	$(document).hammer(hammerOptions).on('drag', function (event){
		event.gesture.preventDefault();
		if (gameContent.building != null) {
			var e = {
				x: event.gesture.center.pageX,
				y: event.gesture.center.pageY
			};
			inputDispatcher.onMouseMove(e);
		} else if (input.isSelectionRectangle) {
			//selection rectangle
			var e = {
				x: event.gesture.center.pageX,
				y: event.gesture.center.pageY
			};

			if (gameContent.selectionRectangle.length == 0) {
				gameContent.selectionRectangle[0] = e.x;
				gameContent.selectionRectangle[1] = e.y;
			}

			userInput.selectGroup(e.x, e.y);
			inputDispatcher.onMouseMove(e);
		} else {
			//drag map
			var e = {
				dx: -event.gesture.deltaX * input.DRAG_FACTOR,
				dy: event.gesture.deltaY * input.DRAG_FACTOR
			}
			inputDispatcher.onTouchDrag(e);
		}
	});

	$(document).hammer(hammerOptions).on('pinch', function (event) {
		event.gesture.preventDefault();
		var e = {
			wheelDelta: (event.gesture.scale - 1) * 5
		}
		inputDispatcher.onMouseWheel(e);
	});

	$(document).hammer(hammerOptions).on('doubletap', function (event) {
		var e = {
			x: event.gesture.center.pageX,
			y: event.gesture.center.pageY,
			which: 1
		};
		inputDispatcher.onDoubleClick(e);
	});

	$(document).hammer(hammerOptions).on('release', function (event) {
  		inputDispatcher.onMouseUp(event);
  		input.isSelectionRectangle = false;
	});

}