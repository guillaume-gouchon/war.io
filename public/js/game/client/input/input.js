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
	return true;
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
		//if (event.gesture.deltaTime > 100) {
			var e = {
				x: event.gesture.center.pageX,
				y: event.gesture.center.pageY
			};
			console.log(e);
		  	inputDispatcher.onLeftClick(e);
		//}
	});

	$(document).hammer().on('doubletap', function (event) {
		var e = {
			x: event.gesture.center.pageX,
			y: event.gesture.center.pageY
		};
	  	inputDispatcher.onRightClick(e);
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

	$(document).hammer().on('drag', function (event){
		var e = {
			dx: -event.gesture.deltaX / 10,
			dy: event.gesture.deltaY / 10
		}
		inputDispatcher.onTouchDrag(e);
	});

	$(document).hammer().on('pinch', function (event) {
		var e = {
			wheelDelta: event.gesture.scale - 1
		}
		inputDispatcher.onMouseWheel(e);
	});

	$(document).hammer().on('hold', function (event) {
		var e = {
			x: event.gesture.center.pageX,
			y: event.gesture.center.pageY,
			which: 1
		};
		inputDispatcher.onDoubleClick(e);
	});

	$(document).hammer().on('release', function (event) {
  		inputDispatcher.onMouseUp(event);
	});

}