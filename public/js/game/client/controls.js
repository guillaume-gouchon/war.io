/**
 * @author Eberhard Graether / http://egraether.com/
 */

THREE.TrackballControls = function ( object, domElement ) {

	var _this = this;
	var STATE = { NONE: -1, SELECTION: 0, ROTATE_ZOOM: 1, ACTION: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM: 4, TOUCH_PAN: 5 };

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.enabled = true;

	this.screen = { width: 0, height: 0, offsetLeft: 0, offsetTop: 0 };
	this.radius = ( this.screen.width + this.screen.height ) / 4;

	this.rotateSpeed = 0.5;
	this.panSpeed = 0.8;

	// click mode
	this.MODES = {
		normal : order.SPECIAL_ORDERS.normal,
		attack : order.SPECIAL_ORDERS.attack,
		patrol : order.SPECIAL_ORDERS.patrol
	};
	this.clickMode = this.MODES.normal;

	// game window scrolling
	this.scroll = [0, 0];
	this.MAP_SCROLL_SPEED = 6;
	this.SCROLL_THRESHOLD = 15;
	this.isKeyboardScrolling = false;

	// zoom
	this.zoomSpeed = 1.2;
	this.ZOOM_MAX = 30;
	this.ZOOM_MIN = 230;

	// rotation
	this.WHEEL_ROTATION_SPEED = 40;
	this.ANGLE_ROTATION_MIN = 0.005;

	this.PAN_LIMITS = [-100, -100, gameContent.map.size.x * gameSurface.PIXEL_BY_NODE + 100, gameContent.map.size.y * gameSurface.PIXEL_BY_NODE + 100];

	this.noRotate = false;
	this.noZoom = false;
	this.noPan = false;

	this.staticMoving = true;
	this.dynamicDampingFactor = 0.3;

	this.minDistance = 0;
	this.maxDistance = Infinity;

	this.mousePosition = {};

	// internals

	this.target = new THREE.Vector3();

	var lastPosition = new THREE.Vector3();

	var _state = STATE.NONE,
	_prevState = STATE.NONE,

	_eye = new THREE.Vector3(),

	_rotateStart = new THREE.Vector3(),
	_rotateEnd = new THREE.Vector3(),

	_zoomStart = new THREE.Vector2(),
	_zoomEnd = new THREE.Vector2(),

	_touchZoomDistanceStart = 0,
	_touchZoomDistanceEnd = 0,

	_panStart = new THREE.Vector2(),
	_panEnd = new THREE.Vector2();

	_oldEye = null;
	_oldUp = null;
	_oldTarget = null;
	_oldRotateStart = null;

	// shortcuts
	this.KEYBOARD_SHORTCUTS = [81, 87, 69, 82, 65, 83, 68, 70];

	// for reset

	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.up0 = this.object.up.clone();

	// events

	var changeEvent = { type: 'change' };


	// methods

	this.handleResize = function () {

		this.screen.width = window.innerWidth;
		this.screen.height = window.innerHeight;

		this.screen.offsetLeft = 0;
		this.screen.offsetTop = 0;

		this.radius = ( this.screen.width + this.screen.height ) / 4;

	};

	this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};

	this.getMouseOnScreen = function ( clientX, clientY ) {

		return new THREE.Vector2(
			( clientX - _this.screen.offsetLeft ) / _this.radius * 0.5,
			( clientY - _this.screen.offsetTop ) / _this.radius * 0.5
		);

	};

	this.getMouseProjectionOnBall = function ( clientX, clientY ) {

		var mouseOnBall = new THREE.Vector3(
			( clientX - _this.screen.width * 0.5 - _this.screen.offsetLeft ) / _this.radius,
			( _this.screen.height * 0.5 + _this.screen.offsetTop - clientY ) / _this.radius,
			0.0
		);

		var length = mouseOnBall.length();

		if ( length > 1.0 ) {

			mouseOnBall.normalize();

		} else {

			mouseOnBall.z = Math.sqrt( 1.0 - length * length );

		}

		_eye.copy( _this.object.position ).sub( _this.target );

		var projection = _this.object.up.clone().setLength( mouseOnBall.y );
		projection.add( _this.object.up.clone().cross( _eye ).setLength( mouseOnBall.x ) );
		projection.add( _eye.setLength( mouseOnBall.z ) );

		return projection;

	};

	this.rotateCamera = function () {

		var angle = Math.acos( _rotateStart.dot( _rotateEnd ) / _rotateStart.length() / _rotateEnd.length() );

		if ( angle > _this.ANGLE_ROTATION_MIN) {

			var axis = ( new THREE.Vector3() ).crossVectors( _rotateStart, _rotateEnd ).normalize(),
				quaternion = new THREE.Quaternion();
			axis.x = 0;
			axis.y = 0;

			angle *= _this.rotateSpeed;

			quaternion.setFromAxisAngle( axis, -angle );

			// fixes the zooming issue when rotating
			var eyeHeight = _eye.z;
			_eye.applyQuaternion( quaternion );
			_eye.multiplyScalar( eyeHeight / _eye.z );

			_this.object.up.applyQuaternion( quaternion );

			if ( _this.staticMoving ) {

				_rotateStart.copy( _rotateEnd );

			} else {

				quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
				_rotateStart.applyQuaternion( quaternion );

			}

		}

	};

	this.zoomCamera = function () {

		if ( _state === STATE.TOUCH_ZOOM ) {

			var factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
			_touchZoomDistanceStart = _touchZoomDistanceEnd;

			// zoom limits
			if (_eye.z * factor < _this.ZOOM_MIN && _eye.z * factor > _this.ZOOM_MAX) {

				_eye.multiplyScalar( factor );

			}

		} else {

			var factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

			if ( factor !== 1.0 && factor > 0.0 ) {

				// zoom limits
				if (_eye.z * factor < _this.ZOOM_MIN && _eye.z * factor > _this.ZOOM_MAX) {

					_eye.multiplyScalar( factor );

				}

				if ( _this.staticMoving ) {

					_zoomStart.copy( _zoomEnd );

				} else {

					_zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;

				}

			}

		}

	};

	this.panCamera = function () {

		var mouseChange = _panEnd.clone().sub( _panStart );

		if ( mouseChange.lengthSq() ) {

			mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

			var pan = _eye.clone().cross( new THREE.Vector3(0, 0, 1) ).setLength( _this.scroll[0] );
			pan.add( _eye.clone().multiply( new THREE.Vector3(1, 1, 0) ).setLength( - _this.scroll[1] ) );

			_this.object.position.add( pan );

			if (_this.reachLimits()) {

				_this.object.position.sub( pan );

			} else {

				_this.target.add( pan );

			}

			
			if ( _this.staticMoving ) {

				_panStart = _panEnd;

			} else {

				_panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );

			}

		}

	};

	this.update = function () {

		_eye.subVectors( _this.object.position, _this.target );
		_oldEye = _eye.clone();
		_oldUp = _this.object.up.clone();
		_oldTarget = _this.target.clone();
		_oldRotateStart = _rotateStart.clone();

		if ( !_this.noRotate ) {

			_this.rotateCamera();

		}

		if ( !_this.noZoom ) {

			_this.zoomCamera();

		}

		if ( _this.scroll[0] != 0 || _this.scroll[1] != 0) {

			_panStart = new THREE.Vector2(_this.screen.width / 2, _this.screen.height / 2),
			_panEnd = new THREE.Vector2(_this.screen.width / 2 + _this.scroll[0], _this.screen.height / 2 + _this.scroll[1]);
			_this.panCamera();
		
		} else if (!_this.noPan) {

			_this.panCamera();

		}

		_this.object.position.addVectors( _this.target, _eye );

		if (_this.reachLimits()) {

			_this.object.position.subVectors( _this.target, _eye );

			// reset
			_eye = _oldEye;
			_this.target = _oldTarget;
			_this.object.up = _oldUp;
			_rotateStart = _oldRotateStart;

			_this.object.position.addVectors( _this.target, _oldEye );

		}

		_this.object.lookAt( _this.target );
		

		if ( lastPosition.distanceToSquared( _this.object.position ) > 0 ) {

			_this.dispatchEvent( changeEvent );

			lastPosition.copy( _this.object.position );

		}

	};

	this.reset = function () {

		_state = STATE.NONE;
		_prevState = STATE.NONE;

		_this.target.copy( _this.target0 );
		_this.object.position.copy( _this.position0 );
		_this.object.up.copy( _this.up0 );

		_eye.subVectors( _this.object.position, _this.target );

		_this.object.lookAt( _this.target );

		_this.dispatchEvent( changeEvent );

		lastPosition.copy( _this.object.position );

	};


	this.reachLimits = function () {
		if (_this.object.position.x < _this.PAN_LIMITS[0] || _this.object.position.y < _this.PAN_LIMITS[1]
		 || _this.object.position.x > _this.PAN_LIMITS[2] || _this.object.position.y > _this.PAN_LIMITS[3]) {
			return true;
		}

		return false;
	}

	// listeners

	function keydown( event ) {

		if ( _this.enabled === false ) return;

		_prevState = _state;

		/*if ( _state !== STATE.NONE ) {
			return;
		}*/

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
				updateScrolling(1, 1, true);
				return false;
				break;
			case 40 :
				updateScrolling(1, -1, true);
				return false;
				break;
			case 39 :
				updateScrolling(0, -1, true);
				return false;
				break;
			case 37 :
				updateScrolling(0, 1, true);
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

		if (!userInput.isChatWindowOpen) {

			// keyboard shortcuts
			var index = _this.KEYBOARD_SHORTCUTS.indexOf(event.keyCode);
			if (index >= 0) {
				userInput.pressToolbarShortcut(index);
				return false;
			}

		}



	}

	function keyup( event ) {

		if ( _this.enabled === false ) return;

		_state = STATE.NONE;

		switch(event.keyCode) {
			case 13 :
				//this.onEnterKey();
			case 38 :
				updateScrolling(1, 0, true);
			break;
			case 40 :
				updateScrolling(1, 0, true);
				break;
			case 39 :
				updateScrolling(0, 0, true);
				break;
			case 37 :
				updateScrolling(0, 0, true);
				break;
		}

	}

	function mousedown( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( _state === STATE.NONE ) {

			_state = event.button;

		}

		if ( _state === STATE.ROTATE_ZOOM  ) {

			if (event.keyCode == 0 && !_this.noRotate) {

				// rotation
				_rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.clientX, event.clientY );

			} else if (!_this.noZoom) {

				// zoom
				_zoomStart = _zoomEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

			}

		} else if (_state === STATE.SELECTION) {

			if (_this.clickMode != _this.MODES.normal) {

				// do special action
				userInput.doAction( event.clientX, event.clientY, event.shiftKey, _this.clickMode );

				// leave special click mode
				_this.clickMode = _this.MODES.normal;
				
			} else {

				// left click = selection
				userInput.doSelect( event.clientX, event.clientY, event.ctrlKey, event.shiftKey );

			}

		} else if (_state === STATE.ACTION) {

			if (_this.clickMode != _this.MODES.normal) {

				// leave special click mode
				_this.clickMode = _this.MODES.normal;

			} else {

				// right click = action
				userInput.doAction( event.clientX, event.clientY, event.shiftKey, _this.clickMode );

			}

		}

		document.addEventListener( 'mouseup', mouseup, false );

	}

	function mousemove( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( _state === STATE.ROTATE_ZOOM) {

			if (!_this.noRotate && event.keyCode == 0) {

				// rotation
				_rotateEnd = _this.getMouseProjectionOnBall( event.clientX, event.clientY );

			} else if (!_this.noZoom) {

				// zoom
				_zoomEnd = _this.getMouseOnScreen( event.clientX, event.clientY );

			}

		} else if (_state === STATE.SELECTION) {

			// draw selection rectangle
			userInput.drawSelectionRectangle(event.clientX, event.clientY, event.ctrlKey );

		} else {

			if (event.clientX < _this.SCROLL_THRESHOLD) {
				updateScrolling(0, 1, false);
			} else if(event.clientX > window.innerWidth - _this.SCROLL_THRESHOLD) {
				updateScrolling(0, -1, false);
			} else if (!_this.isKeyboardScrolling && _this.scroll[0] != 0) {
				updateScrolling(0, 0, false);
			}

			if (event.clientY < _this.SCROLL_THRESHOLD) {
				updateScrolling(1, 1, false);
			} else if (event.clientY > window.innerHeight - _this.SCROLL_THRESHOLD) {
				updateScrolling(1, -1, false);
			} else if (!_this.isKeyboardScrolling && _this.scroll[1] != 0) {
				updateScrolling(1, 0, false);
			}

			userInput.onMouseMove( event.clientX, event.clientY );

		}

		_this.mousePosition.x = event.clientX;
		_this.mousePosition.y = event.clientY;

	}

	function mouseup( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		_state = STATE.NONE;

		userInput.onMouseUp();

		document.removeEventListener( 'mouseup', mouseup );

	}

	function doubleClick( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		userInput.doDoubleClick( event.clientX, event.clientY );

	}

	function mousewheel( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta / 40;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail / 3;

		}

		if (event.shiftKey) {

			// shift key + wheel = rotation
			_rotateStart = _this.getMouseProjectionOnBall( event.clientX, event.clientY );
			_rotateEnd = _this.getMouseProjectionOnBall( event.clientX + delta * _this.WHEEL_ROTATION_SPEED, event.clientY );
		
		} else {

			// zoom
			_zoomStart.y += delta * 0.01;

		}
		

	}

	function touchstart( event ) {

		if ( _this.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:
				_state = STATE.TOUCH_ROTATE;
				_rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			case 2:
				_state = STATE.TOUCH_ZOOM;
				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				_touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );
				break;

			case 3:
				_state = STATE.TOUCH_PAN;
				_panStart = _panEnd = _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			default:
				_state = STATE.NONE;

		}

	}

	function touchmove( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {

			case 1:
				_rotateEnd = _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			case 2:
				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				_touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy )
				break;

			case 3:
				_panEnd = _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			default:
				_state = STATE.NONE;

		}

	}

	function touchend( event ) {

		if ( _this.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:
				_rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			case 2:
				_touchZoomDistanceStart = _touchZoomDistanceEnd = 0;
				break;

			case 3:
				_panStart = _panEnd = _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

		}

		_state = STATE.NONE;

	}

	/**
	*	Handles the map scrolling.
	*/
	function updateScrolling(direction, value, isKeyboard) {
		_this.scroll[direction] = value * _this.MAP_SCROLL_SPEED;
		
		if (isKeyboard) {
		
			_this.isKeyboardScrolling = (value == 0 ? false : true);
		
		}

	};

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousedown', mousedown, false );
	this.domElement.addEventListener( 'mousemove', mousemove, false );
	this.domElement.addEventListener( 'dblclick', doubleClick, false );

	this.domElement.addEventListener( 'mousewheel', mousewheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );

	window.addEventListener( 'keydown', keydown, false );
	window.addEventListener( 'keyup', keyup, false );

	this.handleResize();

};

THREE.TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );
