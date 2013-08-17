var controls = {};


/**
* 	CONSTANTS
*/
controls.SCROLL_THRESHOLD = 15;
controls.STATE = { NONE: -1, SELECTION: 0, ACTION: 2};
controls.MODES = {
		normal : order.SPECIAL_ORDERS.normal,
		attack : order.SPECIAL_ORDERS.attack,
		patrol : order.SPECIAL_ORDERS.patrol
	};
controls.MAP_SCROLL_SPEED = 2;
controls.SCROLL_THRESHOLD = 15;


/**
*	VARIABLES
*/
controls.clickMode = controls.MODES.normal;
controls.mousePosition = {};
controls._state = controls.STATE.NONE;
controls.scroll = [0, 0];
controls.isKeyboardScrolling = false;
controls.cameraMovesLimits = null;


controls.init = function () {
	window.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	window.addEventListener( 'keydown', controls.keydown, false );
	window.addEventListener( 'keyup', controls.keyup, false );
	window.addEventListener( 'mousedown', controls.mousedown, false );
	window.addEventListener( 'mousemove', controls.mousemove, false );
	window.addEventListener( 'dblclick', controls.doubleClick, false );
	this.cameraMovesLimits = [-100, -100, gameContent.map.size.x * gameSurface.PIXEL_BY_NODE + 100, gameContent.map.size.y * gameSurface.PIXEL_BY_NODE + 100];
}


/**
*	Called every frame
*/
controls.updateCamera = function () {
    // limit rotation
    if (camera.beta < 0.1)
        camera.beta = 0.1;
    else if (camera.beta > (Math.PI / 2) * 0.92)
        camera.beta = (Math.PI / 2) * 0.92;

    // limit zoom
    if (camera.radius > 70)
        camera.radius = 70;
    if (camera.radius < 5)
        camera.radius = 5;

    if (this.scroll[0] != 0 || this.scroll[1] != 0) {
        var diffMove = {
            x: - this.scroll[0] * Math.cos(camera.alpha + Math.PI/2) - this.scroll[1] * Math.cos(camera.alpha),
            z: - this.scroll[0] * Math.sin(camera.alpha + Math.PI/2) - this.scroll[1] * Math.sin(camera.alpha)
        };

        // limit camera moves
        if (camera.target.x + diffMove.x > this.cameraMovesLimits[0] && camera.target.x + diffMove.x < this.cameraMovesLimits[2]
        	&& camera.target.z + diffMove.z > this.cameraMovesLimits[1] && camera.target.z + diffMove.z < this.cameraMovesLimits[3]) {
	    	camera.target = new BABYLON.Vector3(camera.target.x + diffMove.x, 0, camera.target.z + diffMove.z);
		}
	}
}


controls.keydown = function (event) {

	switch(event.keyCode) {
			case 8 :// back key
			return true;
			case 13 :// enter key
			userInput.pressEnterKey();
			return true;
			case 32 :// space key
			userInput.pressSpaceKey();
			return true;
			case 38 :
			controls.updateScrolling(1, 1, true);
			return false;
			break;
			case 40 :
			controls.updateScrolling(1, -1, true);
			return false;
			break;
			case 39 :
			controls.updateScrolling(0, -1, true);
			return false;
			break;
			case 37 :
			controls.updateScrolling(0, 1, true);
			return false;
			break;
			case 83 :// S
			userInput.pressStopKey();
			return true;
			break;
			case 72 :// H
			userInput.pressHoldKey();
			return true;
			break;
			case 80 :// P
			userInput.enterPatrolMode();
			return true;
			break;
			case 65 :// A
			userInput.enterAttackMode();
			return true;
			break;
			case 49 :
			event.preventDefault();
			userInput.pressHotKey(0, event.ctrlKey);
			return true;
			break;
			case 50 :
			event.preventDefault();
			userInput.pressHotKey(1, event.ctrlKey);
			return true;
			break;
			case 51 :
			event.preventDefault();
			userInput.pressHotKey(2, event.ctrlKey);
			return true;
			break;
			case 52 :
			event.preventDefault();
			userInput.pressHotKey(3, event.ctrlKey);
			return true;
			break;
			case 53 :
			event.preventDefault();
			userInput.pressHotKey(4, event.ctrlKey);
			return true;
			break;
		}
}

	
controls.keyup = function (event) {

	switch(event.keyCode) {
		case 38 :
			controls.updateScrolling(1, 0, true);
			break;
		case 40 :
			controls.updateScrolling(1, 0, true);
			break;
		case 39 :
			controls.updateScrolling(0, 0, true);
			break;
		case 37 :
			controls.updateScrolling(0, 0, true);
			break;
	}
}


/**
*	Handles the map scrolling.
*/
controls.updateScrolling = function (direction, value, isKeyboard) {
	this.scroll[direction] = value * this.MAP_SCROLL_SPEED;
	if (isKeyboard) {
		this.isKeyboardScrolling = (value == 0 ? false : true);
	}
}


controls.mousedown = function (event) {

	if (event.button == 1) { return; }

	event.preventDefault();
	event.stopPropagation();

	if (event.button == 0) {
		if (controls.clickMode != controls.MODES.normal) {
			// do special action
			userInput.doAction( event.clientX, event.clientY, event.shiftKey, controls.clickMode );

			// leave special click mode
			userInput.leaveSpecialClickMode();
		} else {
			// left click = selection
			controls._state = controls.STATE.SELECTION;
			userInput.doSelect( event.clientX, event.clientY, event.ctrlKey, event.shiftKey );
		}
	} else if (event.button == 2) {
		if (controls.clickMode != controls.MODES.normal) {

			// leave special click mode
			userInput.leaveSpecialClickMode();

		} else {
			// right click = action
			userInput.doAction( event.clientX, event.clientY, event.shiftKey, controls.clickMode );
		}
	}

	document.addEventListener( 'mouseup', mouseup, false );
}

controls.mousemove = function (event) {

	event.preventDefault();
	event.stopPropagation();

console.log
	if (controls._state === controls.STATE.SELECTION) {
		// draw selection rectangle
		userInput.drawSelectionRectangle(event.clientX, event.clientY, event.ctrlKey );
	} else {
		if (event.clientX < controls.SCROLL_THRESHOLD) {
			controls.updateScrolling(0, 1, false);
		} else if(event.clientX > window.innerWidth - controls.SCROLL_THRESHOLD) {
			controls.updateScrolling(0, -1, false);
		} else if (!controls.isKeyboardScrolling && controls.scroll[0] != 0) {
			controls.updateScrolling(0, 0, false);
		}

		if (event.clientY < controls.SCROLL_THRESHOLD) {
			controls.updateScrolling(1, 1, false);
		} else if (event.clientY > window.innerHeight - controls.SCROLL_THRESHOLD) {
			controls.updateScrolling(1, -1, false);
		} else if (!controls.isKeyboardScrolling && controls.scroll[1] != 0) {
			controls.updateScrolling(1, 0, false);
		}

		userInput.onMouseMove( event.clientX, event.clientY );
	}

	controls.mousePosition.x = event.clientX;
	controls.mousePosition.y = event.clientY;
}

function mouseup( event ) {
	event.preventDefault();
	event.stopPropagation();

	this._state === controls.STATE.NONE;
	userInput.onMouseUp();

	document.removeEventListener( 'mouseup', mouseup );
}

function doubleClick( event ) {
	event.preventDefault();
	event.stopPropagation();

	userInput.doDoubleClick( event.clientX, event.clientY );
}
