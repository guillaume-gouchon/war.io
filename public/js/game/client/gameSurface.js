var gameSurface = {};

var scene, camera, controls;


/**
*	CONSTANTS
*/
gameSurface.MODELS_PATH = 'img/3D/';
gameSurface.PIXEL_BY_NODE = 10;
gameSurface.NEAR = 1;
gameSurface.FAR = 2000;

gameSurface.ZOOM_STEP = 15;
gameSurface.ORDER_ANIMATION_SPEED = 0.015;
gameSurface.ORDER_ROTATION_SPEED = 1 / 12;
gameSurface.ORDER_SIZE_MAX = 0.9;
gameSurface.ORDER_SIZE_MIN = 0.5;
gameSurface.ORDER_OPACITY = 0.3;
gameSurface.FOG_DENSITY = 0.0005;
gameSurface.SELECTION_ENEMY_COLOR = '#f00';
gameSurface.SELECTION_ALLY_COLOR = '#0f0';
gameSurface.SELECTION_NEUTRAL_COLOR = '#e3e314';
gameSurface.CAMERA_INIT_ANGLE = 0.7;
gameSurface.CAN_BUILD_CUBE_COLOR = 0x00ff00;
gameSurface.CANNOT_BUILD_CUBE_COLOR = 0xff0000;
gameSurface.BUILD_CUBE_OPACITY = 0.5;

gameSurface.CENTER_CAMERA_Y_OFFSET = 15 * gameSurface.PIXEL_BY_NODE;
gameSurface.BARS_HEIGHT = 0.5;
gameSurface.BARS_DEPTH = 0.2;
gameSurface.BUILDING_STRUCTURE_SIZE = 5;
gameSurface.BUILDING_INIT_Z = - 1.5 * gameSurface.PIXEL_BY_NODE;
gameSurface.ARMIES_COLORS = ['_red', '_blu', '_gre', '_yel'];
gameSurface.PLAYERS_COLORS = ['red', 'blue', 'green', 'yellow'];
gameSurface.MOVEMENT_EXTRAPOLATION_ITERATION = 6;
gameSurface.LAND_HEIGHT_SMOOTH_FACTOR = 65;

gameSurface.FOG_OF_WAR_HEIGHT = 10;
gameSurface.FOG_OF_WAR_UNCOVERED_HEIGHT = -20; // should be < -gameSurface.FOG_OF_WAR_HEIGHT

gameSurface.DEEP_FOG_OF_WAR_HEIGHT = 18;
gameSurface.DEEP_FOG_OF_WAR_UNCOVERED_HEIGHT = -19; // should be < -gameSurface.DEEP_FOG_OF_WAR_HEIGHT

/**
*	VARIABLES
*/
gameSurface.iteration = 0;
gameSurface.geometries = null;
gameSurface.materials = null;
gameSurface.isKeyboardScrolling = false;
gameSurface.stuffToBeLoaded = 0;
gameSurface.ex = [];
gameSurface.orderFactor = -1;


/**
*	OBJECTS
*/
gameSurface.loader = null;
gameSurface.projector = null;
gameSurface.order = null;
gameSurface.canBuildHereMaterial = null;
gameSurface.cannotBuildHereMaterial = null;
gameSurface.basicCubeGeometry = null;
gameSurface.building = null;

//fogs of war
gameSurface.fogOfWarSurface = null;
gameSurface.deepFogOfWarSurface = null;
gameSurface.clock = null;
gameSurface.elementsMemorizedInFog = [];
gameSurface.fogOfWarMatrix = null;
gameSurface.deepFogOfWarMatrix = null;
gameSurface.fogOfWarVerticeIndexesMatrix = null;


/**
*	Initializes the game surface.
*/
gameSurface.init = function () {
	gameSurface.clock = new THREE.Clock();

	$('#loadingLabel').html('Loading');

	scene = new THREE.Scene();

	// init camera
	camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, this.NEAR, this.FAR);

	// init camera controls / input
	controls = new THREE.TrackballControls(camera);

	// init simple fog
	scene.fog = new THREE.Fog( 0xffffff, this.FOG_DENSITY, 600);

	// init renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
	document.body.appendChild(renderer.domElement);

	// init variables
	this.projector = new THREE.Projector();
	this.geometries = {};
	this.materials = {};
	this.loader = new THREE.JSONLoader();

	// count the number of stuff to be loaded
	gameSurface.stuffToBeLoaded += 8;
	for (var i in gameData.ELEMENTS) {
		for (var j in gameData.ELEMENTS[i]) { 
			for (var k in gameData.ELEMENTS[i][j]) {
				// geometry + 1 texture
				gameSurface.stuffToBeLoaded += 2;
				// additional textures for players colors
				if (i != gameData.FAMILIES.land) {
					gameSurface.stuffToBeLoaded += gameContent.players.length - 1;
				}
			}
		}
	}

	// init scene
	this.createScene();
	this.init3DModels();

	// add listeners
	window.addEventListener('resize', this.onWindowResize, false);


	function render() {
		gameSurface.iteration = (gameSurface.iteration > 1000 ? 0 : gameSurface.iteration + 1);

		requestAnimationFrame(render);
		controls.update();

		gameSurface.updateMoveExtrapolation();
		gameSurface.updateOrderPosition();

		// animations
		TWEEN.update();

		// update GUI
		if (gameSurface.iteration % (1 / GUI.UPDATE_FREQUENCY) == 0) {
			GUI.update();
		}

		renderer.render(scene, camera);

	}

	render();
}


/**
*	Creates the scene.
*/
gameSurface.createScene = function () {

	//add light
	var pointLight = new THREE.PointLight(0xFFFFFF);
	pointLight.position.x = 0;
	pointLight.position.y = 0;
	pointLight.position.z = 150;
	scene.add(pointLight);

	//add skybox
	var materialArray = [];
	var skyboxMaterial = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture(this.MODELS_PATH + 'skybox.jpg', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()})});
   	skyboxMaterial.side = THREE.BackSide;
	for (var i = 0; i < 6; i++) {
		materialArray.push(skyboxMaterial);
	}
	var skyboxMaterial = new THREE.MeshFaceMaterial(materialArray);
	var skyboxGeom = new THREE.CubeGeometry(2000, 2000, 2000);
	var skybox = new THREE.Mesh(skyboxGeom, skyboxMaterial);
	skybox.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
	skybox.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
	scene.add(skybox);

	//generate the land
	var landGeometry = new THREE.PlaneGeometry(2200, 2200, 64, 64);
	var grassTexture  = THREE.ImageUtils.loadTexture(this.MODELS_PATH + 'grass2.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()});
	grassTexture.wrapT = grassTexture.wrapS = THREE.RepeatWrapping;
	grassTexture.repeat.set(32,32);
	var grassMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });
	var planeSurface = new THREE.Mesh(landGeometry, grassMaterial);
    planeSurface.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
    planeSurface.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
    planeSurface.overdraw = true;
    scene.add(planeSurface);

    ///generate the fog
	var fogGeometry = new THREE.PlaneGeometry(1000, 1000, gameContent.map.size.x, gameContent.map.size.y);
	var fogTexture  = THREE.ImageUtils.loadTexture(this.MODELS_PATH + 'fog.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()});
	fogTexture.wrapT = fogTexture.wrapS = THREE.RepeatWrapping;
	var fogMaterial = new THREE.MeshBasicMaterial({ map: fogTexture, transparent: true, opacity:.7 });
	var planeSurface = new THREE.Mesh(fogGeometry, fogMaterial);
    planeSurface.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
    planeSurface.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
    planeSurface.position.z = 1;
    planeSurface.overdraw = true;
    scene.add(planeSurface);
    gameSurface.fogOfWarSurface = planeSurface;

    //generate the deep fog
	var fogGeometry = new THREE.PlaneGeometry(1000, 1000, gameContent.map.size.x, gameContent.map.size.y);
	//var fogTexture  = THREE.ImageUtils.loadTexture(this.MODELS_PATH + 'fog.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()});
	//fogTexture.wrapT = fogTexture.wrapS = THREE.RepeatWrapping;
	var fogMaterial = new THREE.MeshBasicMaterial({ map: fogTexture, transparent:true, opacity:.75 });
	var planeSurface = new THREE.Mesh(fogGeometry, fogMaterial);
    planeSurface.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
    planeSurface.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
    planeSurface.position.z = this.DEEP_FOG_OF_WAR_HEIGHT;
    planeSurface.overdraw = true;
    //scene.add(planeSurface);
    gameSurface.deepFogOfWarSurface = planeSurface;


    // link game coordinates to fog of war vertice indexes
    this.fogOfWarVerticeIndexesMatrix = [];
    for ( var i = 0, l = fogGeometry.vertices.length; i < l; i ++ ) {
    	var verticeGamePosition = {x:Math.round((fogGeometry.vertices[i].x / gameSurface.PIXEL_BY_NODE + gameContent.map.size.x/2)),
    		y:Math.round((fogGeometry.vertices[i].y / gameSurface.PIXEL_BY_NODE + gameContent.map.size.y/2))};
		//var verticeGamePosition = this.convertScenePositionToGamePosition({x:fogGeometry.vertices[i].x, y:fogGeometry.vertices[i].y});
		if (this.fogOfWarVerticeIndexesMatrix[verticeGamePosition.x] == undefined)
			this.fogOfWarVerticeIndexesMatrix[verticeGamePosition.x] = [];
		if (this.fogOfWarVerticeIndexesMatrix[verticeGamePosition.x][verticeGamePosition.y] == undefined)
			this.fogOfWarVerticeIndexesMatrix[verticeGamePosition.x][verticeGamePosition.y] = [];
		this.fogOfWarVerticeIndexesMatrix[verticeGamePosition.x][verticeGamePosition.y].push(i);
		// this.fogOfWarVerticeIndexesMatrix[verticeGamePosition.x][verticeGamePosition.y] = i;
	}

	this.fogOfWarMatrix = [];
	this.deepFogOfWarMatrix = [];
	for ( var x = 0; x < gameContent.map.size.x; x++) {
		this.fogOfWarMatrix[x] = [];
		this.deepFogOfWarMatrix[x] = [];
		for ( var y = 0; y < gameContent.map.size.y; y++) {
			this.fogOfWarMatrix[x][y] = 0;
			this.deepFogOfWarMatrix[x][y] = false;
	}


	//add order geometry
	this.order = new THREE.Mesh(new THREE.TorusGeometry(5, 2, 2, 6), new THREE.LineBasicMaterial( { color: '#0f0', opacity: this.ORDER_OPACITY, transparent: true} ));
	this.order.visible = false;
	scene.add(this.order);

	//init basic materials and geometries
	this.canBuildHereMaterial = new THREE.LineBasicMaterial({color: this.CAN_BUILD_CUBE_COLOR, opacity: this.BUILD_CUBE_OPACITY, transparent: true });
	this.cannotBuildHereMaterial = new THREE.LineBasicMaterial({color: this.CANNOT_BUILD_CUBE_COLOR, opacity: this.BUILD_CUBE_OPACITY, transparent: true });
	this.basicCubeGeometry = new THREE.CubeGeometry(this.PIXEL_BY_NODE, this.PIXEL_BY_NODE, this.PIXEL_BY_NODE);

	//add building geometry
	this.building = new THREE.Object3D();
	for (var i = 0; i < this.BUILDING_STRUCTURE_SIZE; i++) {
		for (var j = 0; j < this.BUILDING_STRUCTURE_SIZE; j++) {
			var cube = new THREE.Mesh(this.basicCubeGeometry, this.canBuildHereMaterial);
			cube.position.x = i * this.PIXEL_BY_NODE;
			cube.position.y = j * this.PIXEL_BY_NODE;
			cube.visible = false;
			this.building.add(cube);
		}
	}
	this.building.visible = false;
	scene.add(this.building);	
}


/**
*	Loads all the 3D models needed.
*/
gameSurface.init3DModels = function () {
	for (var i in gameData.ELEMENTS) {
		for (var j in gameData.ELEMENTS[i]) { 
			for (var k in gameData.ELEMENTS[i][j]) {
				var elementData = gameData.ELEMENTS[i][j][k];
				if (this.geometries[elementData.g] == null) {
					this.geometries[elementData.g] = {};
					this.loadObject(elementData.g, i);	
				}
			}
		}
	}
}


/**
*	Loads a geometry.
*/
gameSurface.loadObject = function (key, elementFamily) {
	this.loader.load(this.MODELS_PATH + key, this.geometryLoaded(key));
	if (elementFamily != gameData.FAMILIES.land) {
		for (var n = 0; n < gameContent.players.length; n++) {
			var color = this.ARMIES_COLORS[n];
			gameSurface.materials[key + color] = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + key.replace('.js', '') + color + '.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()})});
			gameSurface.materials["HIDDEN" + key + color] = new THREE.MeshBasicMaterial({color: 0x555555, map: THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + key.replace('.js', '') + color + '.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()})});
		}
	} else {
		gameSurface.materials[key] = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + key.replace('.js', '.png'), new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()})});
		gameSurface.materials["HIDDEN" + key] = new THREE.MeshBasicMaterial({color: 0x555555, map: THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + key.replace('.js', '.png'), new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()})});
	}
}


/**
*	Callback when a geometry is loaded.
*/
gameSurface.geometryLoaded = function (key) {
	return function (geometry, materials) {
		gameSurface.geometries[key] = geometry;
		gameSurface.updateLoadingCounter();
	};
}


/**
*	Updates the loading counter and starts the game if everything is loaded.
*/
gameSurface.updateLoadingCounter = function () {
	this.stuffToBeLoaded --;
	if(this.stuffToBeLoaded == 0) {
		if (gameManager.isOfflineGame) {
			gameManager.startGame();
		} else {
			gameManager.readyToPlay();	
		}
	}
}



/**
*	Called when the user has resized the browser window.
*/
gameSurface.onWindowResize = function() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth - 5, window.innerHeight - 5);

	controls.handleResize();
}


/**
*	Adds a new game element.
*	It creates the game element's 3D model and adds it to the scene.
*/
gameSurface.addElement = function (element) {
	var elementData = gameData.ELEMENTS[element.f][element.r][element.t];
	var model = elementData.g;

	var material;
	var hiddenMaterial;
	if (element.f == gameData.FAMILIES.land) {
		material = this.materials[model];
		hiddenMaterial = this.materials["HIDDEN" + model];
	} else  {
		material = this.materials[model + this.ARMIES_COLORS[element.o]];
		hiddenMaterial = this.materials["HIDDEN" + model + this.ARMIES_COLORS[element.o]];
	}

	element.material = material;
	element.hiddenMaterial = hiddenMaterial;

	var object = new THREE.Mesh(this.geometries[model], material);
	object.elementId = element.id;
	this.setElementPosition(object, element.p.x, element.p.y);
	if (model == 'tree.js') {
		object.scale.y = 1.5;
		object.rotation.x = this.de2ra(90);
		object.rotation.y = this.de2ra(Math.random() * 360);
	} else if ( model == 'castle.js') {
		object.scale.x = 3;
		object.scale.y = 3;
		object.scale.z = 3;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'goldmine.js') {
		object.scale.x = 1.5;
		object.scale.y = 1.5;
		object.scale.z = 1.5;
		object.rotation.x = this.de2ra(90);
		object.rotation.y = this.de2ra(Math.random() * 360);
	} else if (model == 'house.js') {
		object.scale.x = 3;
		object.scale.y = 3;
		object.scale.z = 3;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'casern.js') {
		object.scale.x = 2;
		object.scale.y = 2;
		object.scale.z = 2;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'peon.js') {
		object.scale.x = 2;
		object.scale.y = 2;
		object.scale.z = 2;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'swordsman.js') {
		object.scale.x = 2;
		object.scale.y = 2;
		object.scale.z = 2;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'bowman.js') {
		object.scale.x = 2;
		object.scale.y = 2;
		object.scale.z = 2;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'knight.js') {
		object.scale.x = 2;
		object.scale.y = 2;
		object.scale.z = 2;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'tower.js') {
		object.scale.x = 2;
		object.scale.z = 2;
		object.scale.y = 2;
		object.rotation.x = this.de2ra(90);
	}

	element.m = object;
	gameContent.gameElements[Object.keys(gameData.FAMILIES)[element.f]][element.id] = element;
	
	// add life bar on top
	//this.addLifeBar(element);

	// fogs
	if (element.f == gameData.FAMILIES.land || rank.isAlly(gameContent.players, gameContent.myArmy, element)) {
		this.showElement(element);
	}

	// building in construction
	if (element.f == gameData.FAMILIES.building) {
		if (element.cp < 100) {
			object.position.z += this.BUILDING_INIT_Z;
		}
	}

	// add element to grid
	var shape = elementData.shape;
	for(var i in shape) {
		var row = shape[i];
		for(var j in row) {
			var part = row[j];
			if(part > 0) {
				var position = tools.getPartPosition(element, i, j);
				gameContent.grid[position.x][position.y] = element.id;
			}
		}
	}
}


/**
*	Updates an existing game element.
*/
gameSurface.updateElement = function (element) {
	var gameElement = utils.getElementFromId(element.id);
	var object = gameElement.m;

	// movement extrapolation
	if (gameElement.f == gameData.FAMILIES.unit) {
		var dx = element.p.x - gameElement.p.x;
		var dy = element.p.y - gameElement.p.y;

		if (dx != 0 || dy != 0) {
			this.updateOrientation(object, dx, dy);
			this.extrapol(object, dx, dy);
		}
	}

	if (gameManager.isOfflineGame || element.f == gameData.FAMILIES.building) {
		this.setElementPosition(object, element.p.x, element.p.y);	
	}
	
	var elementData = gameData.ELEMENTS[element.f][element.r][element.t];

	if (element.f == gameData.FAMILIES.building && rank.isAlly(gameContent.players, gameContent.myArmy, element)) {
		if (element.cp < 100) {

			// update construction progress
			object.position.z = (100 - element.cp) / 100 * this.BUILDING_INIT_Z;

		} else if (element.q.length > 0) {

			// update progress bar
			var progressBar = null;
			for (var i in object.children) {
				if (object.children[i].id == 'prog') {
					progressBar = object.children[i];
					break;
				}
			}
			if (progressBar == null) {
				var progress = new THREE.Mesh(new THREE.CubeGeometry(this.BARS_DEPTH, this.BARS_HEIGHT, 1), new THREE.MeshBasicMaterial({color: 0xffffff}));
				progress.id = 'prog';
				progress.position.x = elementData.shape.length / 3 * this.PIXEL_BY_NODE / 2;
				progress.position.y = elementData.height + 1;
				progress.rotation.y = this.de2ra(90);
				object.add(progress);
			} else {
				progressBar.scale.x = element.qp / 100 * elementData.shape.length / 3 * this.PIXEL_BY_NODE;
				progressBar.position.x = elementData.shape.length / 3 * this.PIXEL_BY_NODE / 2 * (1 - element.qp / 100);
				
				// population limit reached message
				if (element.qp >= 99 && gameContent.players[gameContent.myArmy].pop.current == gameContent.players[gameContent.myArmy].pop.max) {
					this.showMessage(this.MESSAGES.popLimitReached);
				}
			}
		} else {
			for (var i in object.children) {
				if (object.children[i].id == 'prog') {
					object.remove(object.children[i]);
				}
			}
		}
	}

	if (element.f != gameData.FAMILIES.land) {
		// update life bar
		for (var i in object.children) {
			if (object.children[i].id == 'life') {
				this.updateLifeBar(object.children[i], element, elementData);
				object.children[i].rotation.y = - object.rotation.y + this.de2ra(90);
				break;
			}
		}

		

		if (element.o == gameContent.myArmy && gameElement.l > element.l) {
			// you are being attacked
			GUI.addAlertMinimap(element);
		} else if (element.visible) {
			// update minimap
			GUI.updateElementOnMinimap(element);
		}
	}

	// remove old positions from grid
    var shape = gameData.ELEMENTS[element.f][element.r][element.t].shape;
	for (var i in shape) {
		for (var j in shape[i]) {
			if (shape[i][j] > 0) {
				var partPosition = tools.getPartPosition(gameElement, i, j);
				gameContent.grid[partPosition.x][partPosition.y] = 0;
			}
		}
	}

	// update new positions
	for (var i in shape) {
		for (var j in shape[i]) {
			if (shape[i][j] > 0) {
				var partPosition = tools.getPartPosition(element, i, j);
				gameContent.grid[partPosition.x][partPosition.y] = element.id;
			}
		}
	}

	element.m = object;
	gameContent.gameElements[Object.keys(gameData.FAMILIES)[element.f]][element.id] = element;
}


/**
*	Removes a game element.
*/
gameSurface.removeElement = function (element) {

	// remove from the selected elements if it was
	if (gameContent.selected.indexOf(element.id) >= 0) {
		gameContent.selected.splice(gameContent.selected.indexOf(element.id), 1);
	}

	if (element.f == gameData.FAMILIES.building) {
		// if it is a building, take care of it to respect fog of war memory
		if (element.visible) {
			gameSurface.removeBuildingForGood(element, utils.getElementFromId(element.id).m);
		}
	} else {
		// otherwise let the classic handling do it
		gameSurface.hideElement(element);
	}

	// remove element from the grid
	var shape = gameData.ELEMENTS[element.f][element.r][element.t].shape;
	for(var i in shape) {
		var row = shape[i];
		for(var j in row) {
			var part = row[j];
			if(part > 0) {
				var position = tools.getPartPosition(element, i, j);
				gameContent.grid[position.x][position.y] = 0;
			}
		}
	}

	delete gameContent.gameElements[Object.keys(gameData.FAMILIES)[element.f]][element.id];
}


/**
*	Returns the game coordinates from some screen coordinates.
*/
gameSurface.getAbsolutePositionFromPixel = function (x, y) {
	var intersect = this.getFirstIntersectObject(x, y);
	if (intersect != null) {
		return this.convertScenePositionToGamePosition(intersect.point);
	} else {
		return {x : 0, y : 0};
	}
}


/**
*	Returns first element which intersects with the mouse.
*/
gameSurface.getFirstIntersectObject = function (x, y) {
	var vector = new THREE.Vector3( ( x / window.innerWidth ) * 2 - 1, - ( y / window.innerHeight ) * 2 + 1, 0.5 );
	this.projector.unprojectVector( vector, camera );
	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
	var intersects = raycaster.intersectObjects(scene.children);
	while (intersects[0] != undefined && (intersects[0] == gameSurface.fogOfWarSurface || intersects[0] == gameSurface.deepFogOfWarSurface))
		intersects.unshift();
	if ( intersects.length > 0 ) {
		return intersects[0];	
	}
	return null;
}


/**
*	Centers game window on element.
*/
gameSurface.centerCameraOnElement = function (element) {
	var position = this.convertGamePositionToScenePosition(element.p);
	camera.position.x = position.x;
	camera.position.y = position.y - this.CENTER_CAMERA_Y_OFFSET;
	camera.position.z = controls.ZOOM_MIN;
	controls.target.x = element.m.position.x;
	controls.target.y = element.m.position.y;
	controls.target.z = element.m.position.z;
}


gameSurface.showElement = function (element) {
	if (element.visible)
		return;

	element.visible = true;

	if (this.shouldMemorizeInFog(element) && (index = gameSurface.elementsMemorizedInFog.indexOf(utils.getElementFromId(element.id))) > -1) {
		// if it must be memorized in fog and it is in our fog memory, just remove it from the fog memory as it is now showing
		this.elementsMemorizedInFog.splice(index, 1);
		
		// TODO set alpha or something
		utils.getElementFromId(element.id).m.material = element.material;
	} else {
		this.showElementModel(element);
	}
}

gameSurface.hideElement = function (element) {
	if (!element.visible)
		return;

	element.visible = false;

	if (this.shouldMemorizeInFog(element)) {
		// if it must be memorized in fog, put it in our fog memory rather than hiding it
		this.elementsMemorizedInFog.push(utils.getElementFromId(element.id));

		// TODO set alpha or something
		utils.getElementFromId(element.id).m.material = element.hiddenMaterial;
	} else {
		this.hideElementModel(element);
	}
}

gameSurface.showElementModel = function (element) {
	if (element.modelVisible)
		return;

	element.modelVisible = true;
	var object = utils.getElementFromId(element.id).m;
	if (element.f != gameData.FAMILIES.land) {
		//update minimap
		GUI.addElementOnMinimap(element);
	}
	scene.add(object);
}

gameSurface.hideElementModel = function (element, object) {
	if (!element.modelVisible)
		return;

	element.modelVisible = false;
	if (object == undefined)
		object = utils.getElementFromId(element.id).m;
	if (element.f != gameData.FAMILIES.land) {
		//update minimap
		GUI.removeElementFromMinimap(element);
	}
	scene.remove(object);
}

gameSurface.removeBuildingForGood = function (element, object) {
	GUI.removeElementFromMinimap(element);
	scene.remove(object);
}

gameSurface.manageElementsVisibility = function () {
	var mapW = gameContent.map.size.x;
	var mapH = gameContent.map.size.y;
	var visionMatrix = [];
	var unitsToCheck = [];
	for (var type in gameContent.gameElements) {
		for (var id in gameContent.gameElements[type]) {
			var element = gameContent.gameElements[type][id];
			if (rank.isAlly(gameContent.players, gameContent.myArmy, element)) {
				// ally unit, show vision
				var unitX = element.p.x;
				var unitY = element.p.y;
				var elementData = gameData.ELEMENTS[element.f][element.r][element.t];
				var vision = elementData.vision;

				// manhattan vision
				/*for (x = Math.max(0, unitX-vision), maxX = Math.min(mapW, unitX+vision); x<maxX; x++) {
					for (y = Math.max(0, unitY-vision), maxY = Math.min(mapH, unitY+vision); y<maxY; y++) {
						if (visionMatrix[x] == undefined)
							visionMatrix[x] = [];
						visionMatrix[x][y] = true;
					}
				}*/

				// pythagorean vision
				var squareVision = vision*vision;
				var x,y,squarY;
				for(var y=-vision; y<=vision; y++) {
					var squareY = y*y;
	   				 for(var x=-vision; x<=vision; x++) {
	        			if(x*x+squareY < squareVision) {
	        				var val = 1;
	        				var dist = Math.sqrt(x*x+squareY);
	        				if (dist > vision * .8)
	        					val = (vision-dist) / (vision * .8);

	        				if (visionMatrix[unitX+x] == undefined)
								visionMatrix[unitX+x] = [];
							if (!visionMatrix[unitX+x][unitY+y] || val > visionMatrix[unitX+x][unitY+y])
	            				visionMatrix[unitX+x][unitY+y] = val;
	            		}
	            	}
	            }

			} else {
				// enemy unit, add to the units to check
				unitsToCheck.push(element);
			}
		}
	}

	while (unitsToCheck.length > 0) {
		var element = unitsToCheck.pop();
		if (visionMatrix[element.p.x] != undefined && visionMatrix[element.p.x][element.p.y])
			this.showElement(element);
		else
			this.hideElement(element);
	}


	for (index in this.elementsMemorizedInFog) {
		var element = this.elementsMemorizedInFog[index];
		if (visionMatrix[element.p.x] != undefined && visionMatrix[element.p.x][element.p.y] > 0) {
			// the building could now be visible
			console.log("building to show");
			if (utils.getElementFromId(element.id) == null) {
				// but it has been destroyed, so we remove it for good
				console.log("BOOOM IT DIED");
				var object = this.elementsMemorizedInFog[index].m;
				this.hideElementModel(element, object);
			} else {
				// otherwise we set it to visible
				console.log("show it");
				this.showElement(element);
			}
			this.elementsMemorizedInFog.splice(index, 1);
		}
	}

	var fogGeometry = gameSurface.fogOfWarSurface.geometry;
	var deepFogGeometry = gameSurface.deepFogOfWarSurface.geometry;

	var visible;
	var fogChanged = false;
	var deepFogChanged = false;
	var i, l, z;
	for (var x = 0; x < mapW; x++) {
		for (var y = 0; y < mapH; y++) {
			visible = (visionMatrix[x] == undefined) ? 0 : visionMatrix[x][y];
			if (visible != this.fogOfWarMatrix[x][y]) {
				this.fogOfWarMatrix[x][y] = visible;
				fogChanged = true;
				z = (visible > 0) ? visible * this.FOG_OF_WAR_UNCOVERED_HEIGHT : 0;
				if (this.fogOfWarVerticeIndexesMatrix[x][y].length == 0)
					console.log("NO VERTICE AT " + x + "," + y);
				for (i = 0, l=this.fogOfWarVerticeIndexesMatrix[x][y].length; i<l; i++) {
					fogGeometry.vertices[this.fogOfWarVerticeIndexesMatrix[x][y][i]].z = z;
				}

				if (visible > 0 && this.deepFogOfWarMatrix[x][y] == 0) {
					this.deepFogOfWarMatrix[x][y] = true;
					deepFogChanged = true;
					/*for (i = 0, l=this.fogOfWarVerticeIndexesMatrix[x][y].length; i<l; i++) {
						deepFogGeometry.vertices[this.fogOfWarVerticeIndexesMatrix[x][y][i]].z = this.DEEP_FOG_OF_WAR_UNCOVERED_HEIGHT;
					}*/
					// deepFogGeometry.vertices[this.fogOfWarVerticeIndexesMatrix[x][y]].z = this.DEEP_FOG_OF_WAR_UNCOVERED_HEIGHT;
				}
			}
		}
	}
	if (fogChanged)
		fogGeometry.verticesNeedUpdate = true;
	//if (deepFogChanged)
	//	deepFogGeometry.verticesNeedUpdate = true;

}


// var fogGeometry = gameSurface.fogOfWarSurface.geometry;
// var deepFogGeometry = gameSurface.deepFogOfWarSurface.geometry;
// time = gameSurface.clock.getElapsedTime() * 10;
// 				for ( var i = 0, l = fogGeometry.vertices.length; i < l; i ++ ) {
// 					var x = Math.round((fogGeometry.vertices[i].x / gameSurface.PIXEL_BY_NODE + mapW/2));
// 					var y = Math.round((fogGeometry.vertices[i].y / gameSurface.PIXEL_BY_NODE + mapH/2));
// 					if (visionMatrix[x] != undefined && visionMatrix[x][y]) {
// 						fogGeometry.vertices[ i ].z = -7;
// 						deepFogGeometry.vertices[i].z = -30;
// 					} else
// 						fogGeometry.vertices[ i ].z = 0;// + 1 * Math.sin(time + i);
// 				}

// 				fogGeometry.verticesNeedUpdate = true;
// 				deepFogGeometry.verticesNeedUpdate = true;

				// controls.update( delta );
				// renderer.render( scene, camera );
}

gameSurface.shouldMemorizeInFog = function(element) {
	return (element.f == gameData.FAMILIES.land || element.f == gameData.FAMILIES.building);
}