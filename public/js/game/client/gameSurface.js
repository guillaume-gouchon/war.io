var gameSurface = {};

var scene, camera, controls;


/**
*	CONSTANTS
*/
gameSurface.MODELS_PATH = 'img/3D/';
gameSurface.PIXEL_BY_NODE = 10;
gameSurface.NEAR = 0.1;
gameSurface.FAR = 20000;

gameSurface.ZOOM_STEP = 15;
gameSurface.ORDER_ANIMATION_SPEED = 0.08;
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
gameSurface.BUILD_CUBE_OPACITY = 0.3;

gameSurface.CENTER_CAMERA_Y_OFFSET = 20 * gameSurface.PIXEL_BY_NODE;
gameSurface.BARS_HEIGHT = 0.5;
gameSurface.BARS_DEPTH = 0.2;
gameSurface.BUILDING_STRUCTURE_SIZE = 5;
gameSurface.BUILDING_INIT_Z = - 1.5 * gameSurface.PIXEL_BY_NODE;
gameSurface.ARMIES_COLORS = ['_red', '_blu', '_gre', '_yel'];
gameSurface.PLAYERS_COLORS = ['red', 'blue', 'green', 'yellow'];
gameSurface.PLAYERS_COLORS_RGB = [{r:255,g:0,b:0}, {r:50,g:50,b:255}, {r:25,g:255,b:0}, {r:255,g:255,b:0}];
gameSurface.MOVEMENT_EXTRAPOLATION_ITERATION = 8;
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
gameSurface.stuffLoaded = 0;
gameSurface.totalStuffToLoad = 0;
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
gameSurface.clock = null;
gameSurface.elementsMemorizedInFog = [];
gameSurface.fogOfWarMatrix = null;
gameSurface.deepFogOfWarMatrix = null;

gameSurface.fogOfWarGroundTexture;
gameSurface.fogOfWarDataColor;

gameSurface.mapTexture;
gameSurface.mapDataColor;
gameSurface.minimapCanvas;
gameSurface.minimapContext;
gameSurface.minimapData;

gameSurface.planeSurface;
gameSurface.transparentSurface;
gameSurface.waterSurface;

gameSurface.cameraMinimapPosition = {x:0, y:0};
gameSurface.cameraMinimapAngle = 0;
gameSurface.cameraVisionCorners = [0, 0, 0, 0];

var chibre = 0;
/**
*	Initializes the game surface.
*/
gameSurface.init = function () {
	this.clock = new THREE.Clock();

	$('#loadingLabel').html('Loading');

	scene = new THREE.Scene();

	// init camera
	camera = new THREE.PerspectiveCamera(25, window.innerWidth/window.innerHeight, this.NEAR, this.FAR);

	// init camera controls / input
	controls = new THREE.TrackballControls(camera);

	// init simple fog
	//scene.fog = new THREE.Fog( 0xffffff, this.FOG_DENSITY, 1200);

	// init renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// init variables
	this.projector = new THREE.Projector();
	this.geometries = {};
	this.materials = {};
	this.loader = new THREE.JSONLoader();

	// count the number of stuff to be loaded
	this.totalStuffToLoad += 8;// grass + skybox
	this.totalStuffToLoad += 2; // water textures
	var races = [];
	for (var i in gameContent.players) {

		var factor = 2;
		var r = parseInt(gameContent.players[i].r);
		if (races.indexOf(r) == -1) { 
			races.push(r);
			factor = 3;
		}

		this.totalStuffToLoad += Object.keys(gameData.ELEMENTS[gameData.FAMILIES.unit][r]).length * factor;
		this.totalStuffToLoad += Object.keys(gameData.ELEMENTS[gameData.FAMILIES.building][r]).length * factor;

	}

	this.totalStuffToLoad += (Object.keys(gameData.ELEMENTS[gameData.FAMILIES.land][0]).length - 1) * 3;// water

	// init scene
	this.createScene();
	this.init3DModels();

	// init minimap canvas
	this.minimapCanvas = $('#minimap')[0];
	this.minimapCanvas.width = gameContent.map.size.x;
	this.minimapCanvas.height = gameContent.map.size.y;
	this.minimapContext = this.minimapCanvas.getContext('2d');
	this.minimapData = this.minimapContext.getImageData(0,0,this.minimapCanvas.width, this.minimapCanvas.height);

	// add listeners
	window.addEventListener('resize', this.onWindowResize, false);

	function render() {
		gameSurface.iteration = (gameSurface.iteration > 1000 ? 0 : gameSurface.iteration + 1);

		requestAnimationFrame(render);
		controls.update();

		gameSurface.updateMoveExtrapolation();
		// animations
		TWEEN.update();

		var clockDelta = gameSurface.clock.getDelta();
		gameSurface.waterSurface.animate(clockDelta);

		renderer.render(scene, camera);


		// update GUI
		if (gameSurface.iteration % (1 / GUI.UPDATE_FREQUENCY) == 0) {
			gameSurface.updateOrderPosition();
			GUI.update();
			gameSurface.updateCameraViewBounds();
			gameSurface.updateMinimap();
		}
	}

	render();
}

/**
*	Creates the scene.
*/
gameSurface.createScene = function () {


	//add skybox
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );
	var skyboxType = 'alien';
	var fileExtension = '.jpg';

	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture(this.MODELS_PATH + 'skyboxes/' + skyboxType + '_' + directions[i] + fileExtension, new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()}),
			side: THREE.BackSide
		}));
	var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
	var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
	skyBox.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
	skyBox.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
	scene.add(skyBox);

	//generate the land
	var rwidth = gameContent.map.size.x, rheight = gameContent.map.size.y, rsize = rwidth * rheight;
	this.fogOfWarDataColor = new Uint8Array(rsize * 3);
	/*for ( var i = 0; i < rsize; i++ ) {
        dataColor[i * 3] = 0;
        dataColor[i * 3 + 1] = 0;
        dataColor[i * 3 + 2] = 0;
    }*/


	var grassTexture  = THREE.ImageUtils.loadTexture(this.MODELS_PATH + 'grass2.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()});
	grassTexture.wrapT = grassTexture.wrapS = THREE.RepeatWrapping;
	grassTexture.repeat.set(16,16);


    this.fogOfWarGroundTexture = new THREE.DataTexture( this.fogOfWarDataColor, rwidth, rheight, THREE.RGBFormat );
    this.fogOfWarGroundTexture.needsUpdate = true;

	var attributes = {fogMap:{type: 'f', value: []}};
	var uniforms = {
    	tFog: {type: "t", value: this.fogOfWarGroundTexture},
    	tGrass: {type: "t", value:grassTexture},
    	textRepeat: {type: 'f', value: 16}
    };
	var grassMaterial = new THREE.ShaderMaterial({
		transparent:true,
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: [
            "// These have global scope",
            "varying vec2 vUv;",

            "void main() {",
              "vUv = vec2(uv.x, (1.0-uv.y));",
              "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
            "}",
        ].join("\n"),
        fragmentShader: [
            "uniform sampler2D tFog;",
            "uniform sampler2D tGrass;",
            "varying vec2 vUv;",
            "varying vec2 vUv2;",
            "uniform float textRepeat;",

            "void main() {",
            	"vec2 uv = vUv;",
                "vec4 texel = texture2D( tFog, uv ) * texture2D( tGrass, uv * textRepeat );",
               "gl_FragColor = vec4(texel.rgb, 1.0);  // adjust the alpha",
            "}",
        ].join("\n"),
    });
	//var grassMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });
	// var landGeometry = new THREE.PlaneGeometry(2200, 2200, 64, 64);
	var landGeometry = new THREE.PlaneGeometry(gameContent.map.size.x * this.PIXEL_BY_NODE, gameContent.map.size.y * this.PIXEL_BY_NODE);
	var planeSurface = new THREE.Mesh(landGeometry, grassMaterial);
    planeSurface.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
    planeSurface.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
    scene.add(planeSurface);
    this.planeSurface = planeSurface;

    var transparentSurface = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), new THREE.MeshNormalMaterial({ transparent: true, opacity: 0 }));
	transparentSurface.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
    transparentSurface.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
    transparentSurface.position.z = -1;
    scene.add(transparentSurface);
    this.transparentSurface = transparentSurface;

    var waterTexture = THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + "lava.png", new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()});
    var waterTexture2 = THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + "lava2.png", new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()});
    this.waterSurface = new WaterSurface(3000,3000, 2, waterTexture, waterTexture2);
	this.waterSurface.model.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
    this.waterSurface.model.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
    this.waterSurface.model.position.z = -30;
    scene.add(this.waterSurface.model);

	this.fogOfWarMatrix = [];
	this.deepFogOfWarMatrix = [];
	for ( var x = 0; x < gameContent.map.size.x; x++) {
		this.fogOfWarMatrix[x] = [];
		this.deepFogOfWarMatrix[x] = [];
		for ( var y = 0; y < gameContent.map.size.y; y++) {
			this.fogOfWarMatrix[x][y] = 0;
			this.deepFogOfWarMatrix[x][y] = 0;
		}
	}


	var planeSize = gameContent.map.size.x * 20;
	var steps = 50;
	var stepSize = planeSize / steps;
	var innerBorderThreshold = planeSize / 4;
	var geometry = new THREE.PlaneGeometry(gameContent.map.size.x * this.PIXEL_BY_NODE * 1.5, gameContent.map.size.y * this.PIXEL_BY_NODE * 1.5, steps, steps);
	for (var i=0, l=geometry.faces.length; i<l; i++) {
		var centroid = geometry.faces[i].centroid;
		if (Math.abs(centroid.x)<innerBorderThreshold-stepSize && Math.abs(centroid.y)<innerBorderThreshold-stepSize) {
			geometry.faces.splice(i, 1);
			l--;
			i--;
		}
	}
	for (var i=0, l=geometry.vertices.length; i<l; i++) {
		var vertice = geometry.vertices[i];
		if (Math.abs(vertice.x)<innerBorderThreshold-stepSize && Math.abs(vertice.y)<innerBorderThreshold-stepSize)
			continue;
		/*if (Math.abs(vertice.y)<innerBorderThreshold+stepSize/2) {
			if (vertice.x>=0 && vertice.x < innerBorderThreshold) vertice.x = innerBorderThreshold;
			else if (vertice.x<0 && vertice.x > -innerBorderThreshold) vertice.x = -innerBorderThreshold;
		}
		if (Math.abs(vertice.x)<innerBorderThreshold+stepSize/2) {
			if (vertice.y>=0 && vertice.y < innerBorderThreshold) vertice.y = innerBorderThreshold;
			else if (vertice.y<0 && vertice.y > -innerBorderThreshold) vertice.y = -innerBorderThreshold;
		}*/
		//} else {
			var dist = Math.max(Math.abs(vertice.x), Math.abs(vertice.y))-innerBorderThreshold;
			if (dist < stepSize)
				continue;
			// TODO change here for height management
			vertice.z = Math.pow(.9, dist/10) * 100 - Math.pow(1.1, dist/10) * 20 + 15 - Math.random() * 35;
			//if (dist > 20 && dist < 100)
			//	vertice.z += (100-dist);
			//vertice.x += (Math.random()-.5) * 3;
			//vertice.y += (Math.random()-.5) * 3;
		//}
	}
	geometry.elementsNeedUpdate = true;
	geometry.verticesNeedUpdate = true;
	geometry.computeCentroids();
	geometry.computeFaceNormals();
	var rockTexture  = THREE.ImageUtils.loadTexture(this.MODELS_PATH + 'rock.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()});
	rockTexture.wrapT = rockTexture.wrapS = THREE.RepeatWrapping;
	rockTexture.repeat.set(16,16);
	var surface = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({map:rockTexture}));
    surface.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
    surface.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
    surface.position.z = -.3;
    scene.add(surface);


	//add order geometry
	this.order = new THREE.Mesh(new THREE.TorusGeometry(3, 0.9, 2, 18), new THREE.LineBasicMaterial( { color: '#050'} ));
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
	for (var i in gameContent.players) {

		// load buildings
		for (var j in gameData.ELEMENTS[gameData.FAMILIES.building][gameContent.players[i].r]) {
			var elementData = gameData.ELEMENTS[gameData.FAMILIES.building][gameContent.players[i].r][j];
			if (elementData.g != null && this.geometries[elementData.g] == null) {
				this.geometries[elementData.g] = {};
				this.loadObject(elementData.g, gameData.FAMILIES.building, elementData.r);	
			}
		}

		// load units
		for (var j in gameData.ELEMENTS[gameData.FAMILIES.unit][gameContent.players[i].r]) {
			var elementData = gameData.ELEMENTS[gameData.FAMILIES.unit][gameContent.players[i].r][j];
			if (elementData.g != null && this.geometries[elementData.g] == null) {
				this.geometries[elementData.g] = {};
				this.loadObject(elementData.g, gameData.FAMILIES.unit, elementData.r);	
			}
		}
	}

	// load lands
	for (var i in gameData.ELEMENTS[gameData.FAMILIES.land][0]) {
		var elementData = gameData.ELEMENTS[gameData.FAMILIES.land][0][i];
		if (elementData.g != null && this.geometries[elementData.g] == null) {
			this.geometries[elementData.g] = {};
			this.loadObject(elementData.g, gameData.FAMILIES.land, 0);	
		}
	}
	gameSurface.materials["billboardBar"] = new THREE.SpriteMaterial({color: 0xFFFFFF, useScreenCoordinates:false, map:THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + "fog2.png")});
}


/**
*	Loads a geometry.
*/
gameSurface.loadObject = function (key, family, race) {
	this.loader.load(this.MODELS_PATH + key + '.js', this.geometryLoaded(key));
	if (family != gameData.FAMILIES.land) {
		for (var n = 0; n < gameContent.players.length; n++) {
			if (gameContent.players[n].r == race) {
				var color = this.ARMIES_COLORS[n];
				gameSurface.materials[key + color] = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + key + color + '.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()})});
				gameSurface.materials["HIDDEN" + key + color] = new THREE.MeshBasicMaterial({color: 0x555555, map: THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + key, '' + color + '.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()})});
			}
		}
	} else {
		gameSurface.materials[key] = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + key + '.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()})});
		gameSurface.materials["HIDDEN" + key] = new THREE.MeshBasicMaterial({color: 0x555555, map: THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + key + '.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()})});
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
*	Updates the loading counter and notifies the client about the progression.
*/
gameSurface.updateLoadingCounter = function () {
	this.stuffLoaded ++;
	gameManager.updateLoadingProgress(parseInt(100 * this.stuffLoaded / this.totalStuffToLoad));
	console.log(this.stuffLoaded + ' ' + this.totalStuffToLoad)
}



/**
*	Called when the user has resized the browser window.
*/
gameSurface.onWindowResize = function() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	GUI.initMinimapSize();

	controls.handleResize();
}


/**
*	Adds a new game element.
*	It creates the game element's 3D model and adds it to the scene.
*/
gameSurface.addElement = function (element) {
	var elementData = tools.getElementData(element);
	var model = elementData.g;

	if (element.f == gameData.FAMILIES.land) {
		element.material = this.materials[model];
		element.hiddenMaterial = this.materials["HIDDEN" + model];
	} else  {
		element.material = this.materials[model + this.ARMIES_COLORS[element.o]];
		if (element.f == gameData.FAMILIES.building)
			element.hiddenMaterial = this.materials["HIDDEN" + model + this.ARMIES_COLORS[element.o]];
	}

	var object = new THREE.Mesh(this.geometries[model], element.material);
	object.elementId = element.id;
	this.setElementPosition(object, element.p.x, element.p.y);
	object.rotation.x = this.de2ra(90);
	if (model == 'tree') {
		object.scale.y = 1.5;
		object.rotation.x = this.de2ra(90);
		object.rotation.y = this.de2ra(Math.random() * 360);
	} else if ( model == 'tomato_mothertree') {
		object.scale.x = 3;
		object.scale.y = 3;
		object.scale.z = 3;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'goldmine') {
		object.scale.x = 1.5;
		object.scale.y = 1.5;
		object.scale.z = 1.5;
		object.rotation.x = this.de2ra(90);
		object.rotation.y = this.de2ra(Math.random() * 360);
	} else if (model == 'house') {
		object.scale.x = 3;
		object.scale.y = 3;
		object.scale.z = 3;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'casern') {
		object.scale.x = 2;
		object.scale.y = 2;
		object.scale.z = 2;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'tomato_builder') {
		object.scale.x = 2;
		object.scale.y = 2;
		object.scale.z = 2;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'swordsman') {
		object.scale.x = 2;
		object.scale.y = 2;
		object.scale.z = 2;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'bowman') {
		object.scale.x = 2;
		object.scale.y = 2;
		object.scale.z = 2;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'knight') {
		object.scale.x = 2;
		object.scale.y = 2;
		object.scale.z = 2;
		object.rotation.x = this.de2ra(90);
	} else if (model == 'tower') {
		object.scale.x = 2;
		object.scale.z = 2;
		object.scale.y = 2;
		object.rotation.x = this.de2ra(90);
	}

	// adds new element in the logic
	if (gameManager.isOfflineGame) {
		gameContent.gameElements[Object.keys(gameData.FAMILIES)[element.f]][element.id] = element.toJSON();	
	} else {
		gameContent.gameElements[Object.keys(gameData.FAMILIES)[element.f]][element.id] = element;
	}
	
	gameContent.gameElements[Object.keys(gameData.FAMILIES)[element.f]][element.id].m = object;
	 	

	if (element.f != gameData.FAMILIES.land) {
		// add life bar on top
		this.addLifeBar(utils.getElementFromId(element.id));
	}

	// fogs
	if (rank.isAlly(gameContent.players, gameContent.myArmy, element)) {
		this.showElement(utils.getElementFromId(element.id));
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

	if (element.f == gameData.FAMILIES.building) {
		this.setElementPosition(object, element.p.x, element.p.y);	
	}
	
	var elementData = tools.getElementData(element);

	if (element.f == gameData.FAMILIES.building && rank.isAlly(gameContent.players, gameContent.myArmy, element)) {
		if (element.cp < 100) {

			// update construction progress
			object.position.z = (100 - element.cp) / 100 * this.BUILDING_INIT_Z;

		} else {
			this.updateProgressBar(object, element, elementData);
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
			// TODO : alert : you are being attacked
		}
	}

	// remove old positions from grid
    var shape = elementData.shape;
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

	// TODO this is not the right way to do it
	// we should copy the attributes from element to gameElement
	// otherwise we lose all the local-only attributes on each update

	var visible = gameElement.visible;
	var modelVisible = gameElement.modelVisible;


	//gameElement = utils.copyValuesToObject(element, gameElement);
	if (gameManager.isOfflineGame) {
		gameContent.gameElements[Object.keys(gameData.FAMILIES)[element.f]][element.id] = element.toJSON();
	} else {
		gameContent.gameElements[Object.keys(gameData.FAMILIES)[element.f]][element.id] = element;	
	}
	gameContent.gameElements[Object.keys(gameData.FAMILIES)[element.f]][element.id].m = object;
	gameContent.gameElements[Object.keys(gameData.FAMILIES)[element.f]][element.id].visible = visible;
	gameContent.gameElements[Object.keys(gameData.FAMILIES)[element.f]][element.id].modelVisible = modelVisible;
}


/**
*	Removes a game element.
*/
gameSurface.removeElement = function (element) {

	element = utils.getElementFromId(element.id);

	// remove from the selected elements if it was
	if (gameContent.selected.indexOf(element.id) >= 0) {
		gameContent.selected.splice(gameContent.selected.indexOf(element.id), 1);
	}
	var shouldMemorizeInFog = this.shouldMemorizeInFog(element);
	if (!shouldMemorizeInFog) {
		// if it is a regular element, just hide it, it will be removed
		gameSurface.hideElement(element);
	} else if (element.visible) {
		// if it is kept inside the fog but it is visible right now, remove the model right away
		gameSurface.hideElementModel(element);
	}

	// remove element from the grid
	var elementData = tools.getElementData(element);
	var shape = elementData.shape;
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
*	Returns the game coordinates from some screen coordinates.
*/
gameSurface.getAbsolutePositionFromPixelNoBounds = function (x, y) {
	var intersect = this.getFirstIntersectObject(x, y, [this.transparentSurface]);
	if (intersect != null) {
		return this.convertScenePositionToGamePositionNoBounds(intersect.point);
	} else {
		return {x : 0, y : 0};
	}
}


/**
*	Returns first element which intersects with the mouse.
*/
gameSurface.getFirstIntersectObject = function (x, y, targets) {
	if (targets == undefined)
		targets = scene.children;
	var vector = new THREE.Vector3( ( x / window.innerWidth ) * 2 - 1, - ( y / window.innerHeight ) * 2 + 1, 0.5 );
	this.projector.unprojectVector( vector, camera );
	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
	var intersects = raycaster.intersectObjects(targets);
	if ( intersects.length > 0 ) {
		return intersects[0];	
	}
	return null;
}


/**
*	Returns first element which intersects with the mouse.
*/
gameSurface.updateCameraViewBounds = function () {
	this.cameraVisionCorners = [
		this.getAbsolutePositionFromPixelNoBounds(0,0),
		this.getAbsolutePositionFromPixelNoBounds(window.innerWidth,0),
		this.getAbsolutePositionFromPixelNoBounds(window.innerWidth,window.innerHeight),
		this.getAbsolutePositionFromPixelNoBounds(0,window.innerHeight),
	];
	//console.log(this.cameraVisionCorners);
}


/**
*	Centers game window on element.
*/
gameSurface.centerCameraOnElement = function (element) {
	controls.reset();
	var position = this.convertGamePositionToScenePosition(element.p);
	camera.position.x = position.x;
	camera.position.y = position.y - this.CENTER_CAMERA_Y_OFFSET;
	camera.position.z = controls.ZOOM_MIN;	
	controls.target.x = element.m.position.x;
	controls.target.y = element.m.position.y;
	controls.target.z = element.m.position.z;
}


/**
*	Centers game window on position.
*/
gameSurface.centerCameraOnPosition = function (gamePosition) {
	controls.reset();
	camera.position.x = gamePosition.x;
	camera.position.y = gamePosition.y - this.CENTER_CAMERA_Y_OFFSET;
	camera.position.z = controls.ZOOM_MIN;	
	controls.target.x = gamePosition.x;
	controls.target.y = gamePosition.y;
	controls.target.z = 0;
}


/**
*	Show an element if it is not currently visible.
*	Manages fog memory for elements concerned
*/
gameSurface.showElement = function (element) {
	if (element.visible)
		return;

	element.visible = true;

	if (this.shouldMemorizeInFog(element) && (index = gameSurface.elementsMemorizedInFog.indexOf(utils.getElementFromId(element.id))) > -1) {
		// if it must be memorized in fog and it is in our fog memory, just remove it from the fog memory as it is now showing
		this.elementsMemorizedInFog.splice(index, 1);
		
		// also set the material to the regular one
		utils.getElementFromId(element.id).m.material = element.material;
	} else {
		this.showElementModel(element);
	}
}

/**
*	Hides an element if it is currently visible.
*	Manages fog memory for elements concerned
*/
gameSurface.hideElement = function (element) {
	if (!element.visible)
		return;

	element.visible = false;

	if (this.shouldMemorizeInFog(element)) {
		// if it must be memorized in fog, put it in our fog memory rather than hiding it
		this.elementsMemorizedInFog.push(utils.getElementFromId(element.id));

		// also set the material to the hidden one
		utils.getElementFromId(element.id).m.material = element.hiddenMaterial;
	} else {
		this.hideElementModel(element);
	}
}

/**
*	Shows an element model if it is not currently visible.
*/
gameSurface.showElementModel = function (element) {
	if (element.modelVisible)
		return;

	element.modelVisible = true;
	var object = utils.getElementFromId(element.id).m;
	scene.add(object);
}

/**
*	Hides an element model if it is currently visible.
*/
gameSurface.hideElementModel = function (element, object) {
	if (!element.modelVisible)
		return;

	element.modelVisible = false;
	if (object == undefined)
		object = utils.getElementFromId(element.id).m;
	scene.remove(object);
}

/**
*	Called after each update.
*	Updates the rendered fog of war and shows/hides elements where it is necessary.
*/
gameSurface.manageElementsVisibility = function () {
	var mapW = gameContent.map.size.x;
	var mapH = gameContent.map.size.y;
	var visionMatrix = [];
	var unitsToCheck = [];
	for (var type in gameContent.gameElements) {
		for (var id in gameContent.gameElements[type]) {
			var element = gameContent.gameElements[type][id];
			if (element.f != gameData.FAMILIES.land && rank.isAlly(gameContent.players, gameContent.myArmy, element)) {
				// ally unit, show vision
				var unitX = element.p.x;
				var unitY = element.p.y;
				var elementData = tools.getElementData(element);
				var vision = elementData.vision;

				if (element.f == gameData.FAMILIES.building && element.cp < 100) {
					vision = 2;
				}

				// pythagorean vision
				var squareVision = vision*vision;
				var x,y,squareY,val,squareDist;
				// calculate the fog coefficient around the current unit
				// the position is fully discovered if it is less than 0.6*unitVision away
				// it fades towards fully undiscovered if it is farther
				for(var y=-vision; y<=vision; y++) {
					squareY = y*y;
	   				 for(var x=-vision; x<=vision; x++) {
	        			if((squareDist = x*x+squareY) <= squareVision) {
	        				var dist = Math.sqrt(squareDist);
	        				if (dist >= vision * .6)
	        					val = (vision-dist) / (vision * .4);
	        				else
	        					val = 1;

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
			//console.log("building to show");
			if (utils.getElementFromId(element.id) == null) {
				// but it has been destroyed, so we remove it for good
				//console.log("BOOOM IT DIED");
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


	var visible;
	var fogChanged = false;
	// r,g,b positions in the texture data matrix. increase each by 3 to get the next pixel
	var xy0 = 0, xy1 = 1, xy2 = 2;
	for (var y = 0; y < mapH; y++) {
		for (var x = 0; x < mapW; x++, xy0+=3, xy1+=3, xy2+=3) {
			visible = (visionMatrix[x] === undefined) ? 0 : (visionMatrix[x][y] == undefined) ? 0 : visionMatrix[x][y];
			if (visible != this.fogOfWarMatrix[x][y]) {
				this.fogOfWarMatrix[x][y] = visible;

				if (visible > this.deepFogOfWarMatrix[x][y]) {
					this.deepFogOfWarMatrix[x][y] = visible;
				} else if (this.deepFogOfWarMatrix[x][y] != 0 && visible == 0) {
					visible = .1;
				}
				fogChanged = true;
				this.fogOfWarDataColor[xy0] = this.fogOfWarDataColor[xy1] = this.fogOfWarDataColor[xy2] = Math.round(visible*255);
			}
		}
	}
	if (fogChanged) {
		this.fogOfWarGroundTexture.needsUpdate = true;
	}

}

gameSurface.shouldMemorizeInFog = function(element) {
	return (element.f == gameData.FAMILIES.land || element.f == gameData.FAMILIES.building);
}


gameSurface.updateMinimap = function() {

	var xy = 0, r,g,b,a,vision;
	for (var y = gameContent.map.size.y-1, maxY=0; y >= maxY; y--) {
		for (var x = 0, maxX=gameContent.map.size.x; x < maxX; x++, xy += 4) {
			/*if (this.cameraMinimapPosition.x == x && this.cameraMinimapPosition.y == y) {
			    r=0;
			    g=b=a=255;
			}
			else */if (this.deepFogOfWarMatrix[x][y] == 0) {
				r=g=b=0;
			} else if (this.fogOfWarMatrix[x][y] == 0) {
				this.minimapData.data[xy + 3] = 128;
				continue;
			} else {
				var id = gameContent.grid[x][y];
				if (id > 0) {
					var element = utils.getElementFromId(id);
					if (element.modelVisible) {
						if (element.f == gameData.FAMILIES.land) {
							var elementData = tools.getElementData(element);
							var color = elementData.minimapColor;
							r=color.r;
							g=color.g;
							b=color.b;
						} else if (rank.isAlly(gameContent.players, gameContent.myArmy, element)) {
							r=g=b=255;
						} else {
							var color = gameSurface.PLAYERS_COLORS_RGB[element.o];
							r=color.r;
							g=color.g;
							b=color.b;
						}
						if (this.fogOfWarMatrix[x][y] == 0) {
							r/=3;
							g/=3;
							b/=3;
						}
					}/* else {
						r = 2;
						g = 4;
						b = 2;
					}*/
				} else {
					var val = Math.max(.1,this.fogOfWarMatrix[x][y]);
					r=val*20;
					g=val*40;
					b=val*20;
				}
			}
		    this.minimapData.data[xy + 0] = r;
		    this.minimapData.data[xy + 1] = g;
		    this.minimapData.data[xy + 2] = b;
		    this.minimapData.data[xy + 3] = 255;
		}
	}
	this.minimapContext.putImageData(this.minimapData, 0, 0);
	var ctx = this.minimapContext;

	var corners = gameSurface.cameraVisionCorners;
	ctx.lineWidth = 1;
	ctx.strokeStyle = "white";
	ctx.beginPath();
	ctx.moveTo(corners[3].x, gameContent.map.size.y - corners[3].y);
	for (var i=0; i<4; i++)
		ctx.lineTo(corners[i].x, gameContent.map.size.y - corners[i].y);
	ctx.stroke();

	/*var pos = this.cameraMinimapPosition;
	var x = pos.x;
	var y = gameContent.map.size.y - pos.y;
	var angle = this.cameraMinimapAngle + Math.PI;
	ctx.fillStyle = "rgb(255,0,255)";
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + (Math.cos(angle)+.2)*10, y + (Math.sin(angle)+.2)*10);
	ctx.lineTo(x + (Math.cos(angle)-.2)*10, y + (Math.sin(angle)-.2)*10);
	ctx.lineTo(x, y);
	ctx.fill();*/
}