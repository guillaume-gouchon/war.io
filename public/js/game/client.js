var socketManager = {};


/**
*	VARIABLES
*/
socketManager.socket = null;


/**
*	Connects the client to the server.
*/
socketManager.connect = function () {

	this.socket = io.connect();

	this.socket.on('data', function (data) {
		socketManager.onDataSocket(data);
	});

	this.socket.on('gameData', function (data) {
		socketManager.onGameDataSocket(data);
	});

}


/**
*	WEBSOCKETS INPUT
*/
socketManager.onDataSocket = function (data) {

	switch (data.type) {

		case gameData.TO_CLIENT_SOCKET.login :
			this.sendSocketToServer(gameData.TO_SERVER_SOCKET.login, gameManager.playerId);
			break;

		case gameData.TO_CLIENT_SOCKET.listJoinableGames :
			gameManager.updateJoinableGamesList(data);
			break;

		case gameData.TO_CLIENT_SOCKET.gameStart :
			gameManager.initOnlineGame(data);
			break;

		case gameData.TO_CLIENT_SOCKET.rejoin :
			gameManager.askRejoin(data);
			break;

		case gameData.TO_CLIENT_SOCKET.updateLoadingProgress :
			gameManager.updateLoadingQueue(data);
			break;

		case gameData.TO_CLIENT_SOCKET.updateQueue :
			gameManager.updateQueue(data);
			break;

		case gameData.TO_CLIENT_SOCKET.gameStats :
			gameManager.showStats(data.playerStatus, data.stats);
			break;

	}
}

socketManager.onGameDataSocket = function (data) {
	gameContent.update(data);
}


/**
*	WEBSOCKETS OUTPUT
*/
socketManager.createNewGame = function (data) {
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.createNewGame, data);
}

socketManager.enterSalon = function () {
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.enterSalon, null);
}

socketManager.leaveSalon = function () {
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.leaveSalon, null);
}

socketManager.joinGame = function (playerId, playerName, gameId, armyId) {
	var data = {
		playerId: playerId,
		playerName: playerName,
		gameId: gameId,
		armyId: armyId
	}
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.joinGame, data);
}

socketManager.updateLoadingProgress = function (playerId, gameId, loadingProgress) {
	var data = {
		playerId: playerId,
		gameId: gameId,
		loadingProgress: loadingProgress
	}
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.updateLoadingProgress, data);
}

socketManager.sendOrder = function (gameId, orderType, params) {
	var data = {
		gameId: gameId,
		type: orderType,
		params: params
	};
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.sendOrder, data);
}

socketManager.sendSocketToServer = function (socketType, data) {
	this.socket.emit(socketType, data);
}

socketManager.rejoinGame = function (playerId, gameId) {
	var data = {
		playerId: playerId,
		gameId: gameId
	};
	this.sendSocketToServer(gameData.TO_SERVER_SOCKET.rejoinGame, data);
}
var utils = {};


/**
*	Reads a cookie.
*/
utils.readCookie = function (name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}


/**
*	Creates a cookie.
*/
utils.createCookie = function (name, value) {
	document.cookie = name + "=" + value +"; path=/";
}


/**
*	Is there something under any part of this element ?
*/
utils.canBeBuiltHere = function (building) {
	var point1 = tools.getPartPosition(building, 0, 0);
	var point2 = {
		x : point1.x + building.shape[0].length - 1,
		y : point1.y + building.shape.length - 1
	};

	for (var i = point1.x; i <= point2.x; i++) {
		for (var j = point1.y; j <= point2.y; j++) {
			if (gameContent.grid[i] != null && gameContent.grid[i][j] > 0 || gameSurface.fogOfWarMatrix[i] != null && !gameSurface.fogOfWarMatrix[i][j]) {
				building.canBeBuiltHere = false;
				building.shape[i - point1.x][j - point1.y] = userInput.CANNOT_BE_BUILT_HERE;
			}
		}
	}
}


/**
*	Returns the game element from a chosen id.
*/
utils.getElementFromId = function (id) {
	return gameContent.gameElements[Object.keys(gameData.FAMILIES)[('' + id)[1]]][id];
}

utils.copyValuesToObject = function (src, dst) {
    if(src == null || typeof(src) != 'object')
        return src;

	for (var attr in src) {
		console.log(attr);
		if (dst[attr] == undefined)
			dst[attr] = {};
		dst[attr] = utils.copyValuesToObject(src[attr], dst[attr]);
	}
	return dst;
};var gameContent = {};


/**
*	Useful game information.
*/
gameContent.gameId = null;
gameContent.map = null;
gameContent.players = null;
gameContent.myArmy = null;
gameContent.isRunning = false;


/**
*	Used only in offline game
*/
gameContent.game = null;


/**
*	Main variable used during the game.
*  	It contains all the land's elements, units and buildings.
*/
gameContent.gameElements = {
	land: {},
	building: {},
	unit: {}
};


/**
*	Tells which tile is occupied and which tile is free.
*/
gameContent.grid = [];


/**
*	Contains the current selected elements ids.
*/
gameContent.selected = [];


/**
*	Contains the building that the user wants to construct.
*/
gameContent.building = null;


/**
*	Contains the coordinates of the selection rectangle.
*/
gameContent.selectionRectangle = [];


/**
*	Initializes the game content by retrieving all the game elements from the engine.
*/
gameContent.init = function (data) {

	// init grid
	for(var i = 0; i < this.map.size.x; i++) {
		this.grid[i] = [];
		for(var j = 0; j < this.map.size.y; j++) {
			this.grid[i][j] = 0;
		}
	}

	// add new elements
	for (var i in data) {
		for (var j in data[i]) {
			var element = data[i][j];
			gameSurface.addElement(element);	
			// center camera on town hall
			if (element.f == gameData.FAMILIES.building && element.o == this.myArmy) {
				gameSurface.centerCameraOnElement(utils.getElementFromId(element.id));
			}
		}
	}

}


/**
*	Updates the game content with the changes the engine sent us.	
*/
gameContent.update = function (data) {	

	// add new elements
	for (var i in data.added) {
		var element = data.added[i];
		if (utils.getElementFromId(element.id) == null) {
			gameSurface.addElement(element);
		}
	}

	// remove some elements
	for (var i in data.removed) {
		var element = data.removed[i];
		if (utils.getElementFromId(element.id) != null) {
			gameSurface.removeElement(element);
		}
	}

	// update some modified elements
	for (var i in data.modified) {
		var element = data.modified[i];
		if (utils.getElementFromId(element.id) != null) {
			gameSurface.updateElement(element);
		}
	}

	// update fogs of war
	gameSurface.manageElementsVisibility();

	// check some diplomacy changes
	for (var i in this.players) {
		for (var j in this.players[i].ra) {
			if (this.players[i].ra[j] != data.players[i].ra[j]) {
				this.rankHasChanged(data.players[i], data.players[j]);
			}
		}
	}

	// update players
	this.players = data.players;

	// check for victory / defeat (Offline game only)
	if (gameManager.isOfflineGame && this.players[this.myArmy].s == gameData.PLAYER_STATUSES.victory
		|| this.players[this.myArmy].s == gameData.PLAYER_STATUSES.defeat
		|| this.players[this.myArmy].s == gameData.PLAYER_STATUSES.surrender) {
		// show the stats and stop the game
		gameManager.showStats(this.players[this.myArmy].s, gameContent.game.stats);
		clearInterval(gameManager.offlineGameLoop);
	}

	// show chat messages
	for (var i in data.chat) {
		gameSurface.showMessage({id: parseInt(Math.random() * 1000), text: data.chat[i].text}, gameSurface.PLAYERS_COLORS[data.chat[i].o]);
	}
}


/**
*	One player's rank has changed.
*/
gameContent.rankHasChanged = function (player1, player2) {
	if (player1.ra[player2.o] == gameData.RANKS.enemy) {
		gameSurface.showMessage({id: parseInt(Math.random() * 1000), text: player1.n + ' has declared the war to ' + player2.n + ' !'});
	} else if (player1.ra[player2.o] == gameData.RANKS.neutral
		&& player2.ra[player1.o] == gameData.RANKS.neutral) {
		gameSurface.showMessage({id: parseInt(Math.random() * 1000), text: player1.n + ' and ' + player2.n + ' have signed an alliance !'});
	} else if (player1.ra[player2.o] == gameData.RANKS.neutral) {
		gameSurface.showMessage({id: parseInt(Math.random() * 1000), text: player1.n + ' wants to conclude a pact with ' + player2.n + '...'});
	}
}
var gameSurface = {};

var scene, camera, controls;


/*
	Gives THREE.js Lambert Material a Toon / Cel look
*/
THREE.ShaderLib['lambert'].fragmentShader = THREE.ShaderLib['lambert'].fragmentShader.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
THREE.ShaderLib['lambert'].fragmentShader = "uniform vec3 diffuse;\n" + THREE.ShaderLib['lambert'].fragmentShader.substr(0, THREE.ShaderLib['lambert'].fragmentShader.length-1);
THREE.ShaderLib['lambert'].fragmentShader += [
	"#ifdef USE_MAP",
	"	gl_FragColor = texture2D( map, vUv );",
	"#else",
	"	gl_FragColor = vec4(diffuse, 1.0);",
	"#endif",
	"	vec3 basecolor = vec3(gl_FragColor[0], gl_FragColor[1], gl_FragColor[2]);",
	"	float alpha = gl_FragColor[3];",
	"	float vlf = vLightFront[0];",
	// Clean and simple //
	"	if (vlf< 0.50) { gl_FragColor = vec4(mix( basecolor, vec3(0.0), 0.5), alpha); }",
	"	if (vlf>=0.50) { gl_FragColor = vec4(mix( basecolor, vec3(0.0), 0.3), alpha); }",
	"	if (vlf>=0.75) { gl_FragColor = vec4(mix( basecolor, vec3(1.0), 0.0), alpha); }",
	//"	if (vlf>=0.95) { gl_FragColor = vec4(mix( basecolor, vec3(1.0), 0.3), alpha); }",
	//"	gl_FragColor.xyz *= vLightFront;",
	"}"
	].join("\n");

	console.log(THREE.ShaderLib["lambert"]);

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
	this.totalStuffToLoad += 2;// grass + skybox
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

	var light = new THREE.SpotLight(0xFFFFFF);
	light.position.set(200,-2,200);
	light.rotation.x = light.rotation.y = light.rotation.z = 0;
	light.target.position.set(0.0,0.0,0.0);
	light.target.updateMatrixWorld();
	scene.add(light);

	var ambient = new THREE.AmbientLight( 0x808080 );
	scene.add(ambient);

	// var materialArray = [];
	// for (var i = 0; i < 6; i++)
	// 	materialArray.push( new THREE.MeshBasicMaterial({
	// 		map: THREE.ImageUtils.loadTexture(this.MODELS_PATH + 'skyboxes/' + skyboxType + '_' + directions[i] + fileExtension, new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()}),
	// 		side: THREE.BackSide
	// 	}));
	// var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
	// var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
	// skyBox.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
	// skyBox.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
	// scene.add(skyBox);

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
    this.waterSurface.model.position.z = -20;
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
	var steps = 70;
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
	var maxDist = planeSize/2-innerBorderThreshold;
	for (var i=0, l=geometry.vertices.length; i<l; i++) {
		var vertice = geometry.vertices[i];
		if (Math.abs(vertice.x)<innerBorderThreshold-stepSize && Math.abs(vertice.y)<innerBorderThreshold-stepSize)
			continue;
		var dist;
		if (Math.abs(vertice.x)<innerBorderThreshold) {
			dist = Math.abs(vertice.y)-innerBorderThreshold;
		} else if (Math.abs(vertice.y)<innerBorderThreshold) {
			dist = Math.abs(vertice.x)-innerBorderThreshold;
		} else {
			dist = Math.sqrt(Math.pow(Math.abs(vertice.x)-innerBorderThreshold, 2) + Math.pow(Math.abs(vertice.y)-innerBorderThreshold, 2));
		}
		if (dist < stepSize)
			continue;

		var normDist = dist / maxDist * 10;
			// TODO change here for height management
		// vertice.z = Math.pow(.9, dist/10) * 80 - Math.pow(1.1, dist/10) * 20 + 10 - Math.random() * 20;
		var z;
		// if (normDist <= 40)
			z = Math.exp(-Math.pow(-(normDist-2.5)*.75, 2)) * .7;
		// else
		// 	z = 1/(normDist-1) - .0221;
		if (normDist > 2)
			z -= normDist / 10;
		vertice.z = z * 100 + 10 - Math.random() * 20;
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
	rockTexture.repeat.set(32,32);
	var surface = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({map:rockTexture}));
    surface.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
    surface.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
    surface.position.z = -.3;
    scene.add(surface);


	//add order geometry
	this.order = new THREE.Mesh(new THREE.TorusGeometry(3, 0.9, 2, 18), new THREE.LineBasicMaterial( { color: '#0f0'} ));
	this.order.visible = false;
	scene.add(this.order);

	//init basic materials and geometries
	this.canBuildHereMaterial = new THREE.LineBasicMaterial({color: this.CAN_BUILD_CUBE_COLOR, opacity: this.BUILD_CUBE_OPACITY, transparent: false });
	this.cannotBuildHereMaterial = new THREE.LineBasicMaterial({color: this.CANNOT_BUILD_CUBE_COLOR, opacity: this.BUILD_CUBE_OPACITY, transparent: false });
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
				gameSurface.materials[key + color] = new THREE.MeshLambertMaterial({lights:true, map: THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + key + color + '.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()})});
				gameSurface.materials["HIDDEN" + key + color] = new THREE.MeshLambertMaterial({lights:true, color: 0x555555, map: THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + key, '' + color + '.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()})});
			}
		}
	} else {
		gameSurface.materials[key] = new THREE.MeshLambertMaterial({lights:true, map: THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + key + '.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()})});
		gameSurface.materials["HIDDEN" + key] = new THREE.MeshLambertMaterial({lights:true, color: 0x555555, map: THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH + key + '.png', new THREE.UVMapping(), function () {gameSurface.updateLoadingCounter()})});
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
	} else if ( model == 'hq') {
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
	} else if (model == 'builder') {
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
					var elementData = tools.getElementData(element);
					if (element.modelVisible && element.f != gameData.FAMILIES.land || elementData.minimapColor != null) {
						if (element.f == gameData.FAMILIES.land) {
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
};/**
*	Sets the position of an element.
*/
gameSurface.setElementPosition = function (element, x, y) {
	var scenePosition = this.convertGamePositionToScenePosition({x : x, y : y});
	element.position.x = scenePosition.x;
	element.position.y = scenePosition.y;
	element.position.z = scenePosition.z;
}


/**
*	Converts a game position to a scene position.
*	@param : gamePosition = {x: xPosition, y : yPosition}
*	@return : scenePosition = {x : ... , y : ..., z : ...}
*/
gameSurface.convertGamePositionToScenePosition = function (gamePosition) {
	return {
		x : gamePosition.x * this.PIXEL_BY_NODE,
		y : gamePosition.y * this.PIXEL_BY_NODE,
		z : 0.5
	}
}


/**
*	Converts a scene position to a game position.
*	@param : scenePosition = {x: xPosition, y : yPosition}
*	@return : gamePosition = {x : ... , y : ...}
*/
gameSurface.convertScenePositionToGamePosition = function (scenePosition) {
	return {
		x : Math.min(gameContent.map.size.x - 1, Math.max(0, parseInt(scenePosition.x / this.PIXEL_BY_NODE))),
		y : Math.min(gameContent.map.size.y - 1, Math.max(0, parseInt(scenePosition.y / this.PIXEL_BY_NODE)))
	}
}

/**
*	Converts a scene position to a game position.
*	@param : scenePosition = {x: xPosition, y : yPosition}
*	@return : gamePosition = {x : ... , y : ...}
*/
gameSurface.convertScenePositionToGamePositionNoBounds = function (scenePosition) {
	return {
		x : Math.min(gameContent.map.size.x - 1, parseInt(scenePosition.x / this.PIXEL_BY_NODE)),
		y : Math.min(gameContent.map.size.y - 1, parseInt(scenePosition.y / this.PIXEL_BY_NODE))
	}
}


/**
*	Draws a selection circle.
*/
gameSurface.drawSelectionCircle = function(radius, color) {
 	var cylinder =  new THREE.Mesh(new THREE.TorusGeometry(radius, 0.2, 2, radius * 20), new THREE.LineBasicMaterial( { color: color} ));
 	cylinder.id = 'select';
 	cylinder.rotation.x = this.de2ra(90);
	return cylinder;
}


/**
*	Draws a life bar on top of an element.
*/
gameSurface.drawLifeBar = function (element) {
	var elementData = tools.getElementData(element);

	var spriteMaterial = this.materials["billboardBar"].clone();
	var lifeBar = new THREE.Sprite(spriteMaterial);
	lifeBar.position.y = elementData.height;
	lifeBar.scale.set(1, 1, 0);
	lifeBar.id = 'life';

	this.updateLifeBar(lifeBar, element, elementData);
	return lifeBar;
}


/**
*	Adds a life bar on top of element.
*/
gameSurface.addLifeBar = function (element) {
	var lifeBar = this.drawLifeBar(element);
	var model = element.m;
	model.add(lifeBar);
}


/**
*	Updates the life bar color and size.
*/
gameSurface.updateLifeBar = function (lifeBar, element, elementData) {
	var lifeRatio = element.l / elementData.l;
	lifeBar.scale.x = elementData.lifeBarWidth * lifeRatio;
	lifeBar.material.color.setHex(this.getLifeBarColor(lifeRatio));
}

gameSurface.updateProgressBar = function (object, element, elementData) {
	// update progress bar
	var progressBar = null;
	for (var i in object.children) {
		if (object.children[i].id == 'prog') {
			progressBar = object.children[i];
			break;
		}
	}
	if (element.q.length > 0 && element.qp > 0) {
		if (progressBar == null) {
			var spriteMaterial = this.materials["billboardBar"].clone();
			var progressBar = new THREE.Sprite(spriteMaterial);
			progressBar.scale.set(1, .6, 0);
			progressBar.position.y = elementData.height-.5;
			progressBar.id = 'prog';
			object.add(progressBar);
		}
		progressBar.scale.x = elementData.lifeBarWidth * element.qp / 100;
		progressBar.position.x = - elementData.lifeBarWidth / 14 + progressBar.scale.x / 14;
	} else {
		// population limit reached message
		if (element.qp >= 99 && gameContent.players[gameContent.myArmy].pop.current == gameContent.players[gameContent.myArmy].pop.max) {
			this.showMessage(this.MESSAGES.popLimitReached);
		} else if (progressBar != null) {
			object.remove(progressBar);
		}
	}
}


/**
*	Updates the target element position.
*/
gameSurface.updateOrderPosition = function () {
	if (gameContent.selected.length > 0) {
		var element = utils.getElementFromId(gameContent.selected[0]);
		if (element == null) { 
			this.order.visible = false;
			return; 
		}

	 	if (element.a != null && (element.a.moveTo != null || element.a.id != null) || element.rp != null) {
			var position = null;
			if (element.rp != null) {
				position = element.rp;
			} else if (element.a.moveTo != null) {
				position = element.a.moveTo;
			} else {
				var target = utils.getElementFromId(element.a.id);
				if (target != null) {
					position = target.p;
				} else {
					this.order.visible = false;
					return;
				}
			}

			this.setElementPosition(this.order, position.x, position.y);
			
			if (this.order.scale.x >= gameSurface.ORDER_SIZE_MAX) {
				gameSurface.orderFactor = -1;
			} else if (this.order.scale.x <= gameSurface.ORDER_SIZE_MIN){
				gameSurface.orderFactor = 1;
			}
			this.order.scale.x += this.ORDER_ANIMATION_SPEED * gameSurface.orderFactor;
			this.order.scale.y += this.ORDER_ANIMATION_SPEED * gameSurface.orderFactor;
			this.order.visible = true;
		}  else if (this.order.visible) {
			this.order.visible = false;
		}
	} else if (this.order.visible) {
		this.order.visible = false;
	}
}


/**
*	The user is drawing a selection rectangle.
*/
gameSurface.updateSelectionRectangle = function (x1, y1, x2, y2) {
	var dx = Math.abs(x1 - x2);
	var dy = Math.abs(y1 - y2);
	if (dx > 0 &&  dy > 0) {
		$('#selectionRectangle').css({
			'top' : Math.min(y1, y2),
			'left': Math.min(x1, x2),
			'width': dx,
			'height': dy
		});
		$('#selectionRectangle').removeClass('hide');
	} else {
		$('#selectionRectangle').addClass('hide');
	}
}


/**
*	Converts degree to radians.
*/
gameSurface.de2ra = function(degree) {
	return degree * (Math.PI / 180);
}


/**
*	The user selected an element.
*/
gameSurface.selectElement = function (elementId) {
	var element = utils.getElementFromId(elementId);
	if (element != null) {
		var model = element.m;
		var elementData = tools.getElementData(element);
		var color;
		if (rank.isEnemy(gameContent.players, gameContent.myArmy, element)) {
			color = this.SELECTION_ENEMY_COLOR;
		} else if (rank.isAlly(gameContent.players, gameContent.myArmy, element)) {
			color = this.SELECTION_ALLY_COLOR;
		} else {
			color = this.SELECTION_NEUTRAL_COLOR;
		}

		model.add(this.drawSelectionCircle(elementData.shape.length / 2 * this.PIXEL_BY_NODE / 2, color));
	}
}


/**
*	The user unselected an element.
*/
gameSurface.unselectElement = function (elementId) {
	try {
		var model = utils.getElementFromId(elementId).m;
		var index = model.children.length;
		while (index --) {
			var child = model.children[index];
			if (child.id == 'select') {
				model.remove(child);
			}
		}
	} catch (e) {
	}
}


/**
*	The user unselected all the selected elements.
*/
gameSurface.unselectAll = function () {
	for (var i in gameContent.selected) {
		this.unselectElement(gameContent.selected[i]);
	}
}


/**
*	Updates unit orientation depending on movement.
*/
gameSurface.updateOrientation = function (d, dx, dy) {
	if (dx == 0 && dy < 0) {
	} else if (dx > 0 && dy < 0) {
		d.rotation.y = this.de2ra(45);
	} else if (dx > 0 && dy == 0) {
		d.rotation.y = this.de2ra(90);
	} else if (dx > 0 && dy > 0) {
		d.rotation.y = this.de2ra(135);
	} else if (dx == 0 && dy > 0) {
		d.rotation.y = this.de2ra(180);
	} else if (dx < 0 && dy > 0) {
		d.rotation.y = this.de2ra(225);
	} else if (dx < 0 && dy == 0) {
		d.rotation.y = this.de2ra(270);
	} else if (dx < 0 && dy < 0) {
		d.rotation.y = this.de2ra(315);
	}
}


/**
*	Updates the building geometry.
*/
gameSurface.updateBuildingGeometry = function () {	
	for (var i in this.building.children) {
		this.building.children[i].visible = false;
	}
	var shape = gameContent.building.shape;
	for (var i in shape) {
		for (var j in shape) {
			var material;
			if (shape[i][j] == userInput.CAN_BE_BUILT_HERE) {
				material = this.canBuildHereMaterial;
			} else if (shape[i][j] == userInput.CANNOT_BE_BUILT_HERE) {
				material = this.cannotBuildHereMaterial;
			} else {
				continue;
			}
			var index = i * this.BUILDING_STRUCTURE_SIZE + parseInt(j);
			this.building.children[index].material = material;
			this.building.children[index].visible = true;
		}
	}
	this.setElementPosition(this.building, gameContent.building.p.x - parseInt(shape.length / 2), gameContent.building.p.y - parseInt(shape.length / 2));
	this.building.visible = true;
}


/**
*	Hides the building geometry.
*/
gameSurface.removeBuildingGeometry = function () {
	for (var i in this.building.children) {
		this.building.children[i].visible = false;
	}
	this.building.visible = false;
}


/**
*	Animates the selection circle of an element.
*/
gameSurface.animateSelectionCircle = function (elementId) {
	this.selectElement(elementId);
	var model = utils.getElementFromId(elementId).m;
	var target;
	for (var i in model.children) {
		if (model.children[i].id == 'select') {
			target = model.children[i];
			break;
		}
	}
	var tweenFadeIn = new TWEEN.Tween({alpha:1}).delay(300).to({alpha:0}, 300)
	.onComplete(function () {
		target.visible = false;
	}).start();
	var tweenFadeOut = new TWEEN.Tween({alpha:0}).to({alpha:1}, 300)
	.onComplete(function () {
		target.visible = true;
	});
	var tweenFadeOut2 = new TWEEN.Tween({alpha:0}).to({alpha:1}, 500)
	.onComplete(function () {
		gameSurface.unselectElement(elementId);
	});
	tweenFadeIn.chain(tweenFadeOut);
	tweenFadeOut.chain(tweenFadeOut2);
}


/**
*	Returns the color of the life bar.
*/
gameSurface.getLifeBarColor = function (lifeRatio) {
	if (lifeRatio < 0.3) {
		return 0xff0000;
	} else if (lifeRatio < 0.6) {
		return 0xe3e314;
	} else {
		return 0x00ff00;
	}
}
/**
*	Returns the color of the life bar.
*/
gameSurface.getLifeBarBackgroundColor = function (lifeRatio) {
	if (lifeRatio < 0.25) {
		return 'lowLife';
	} else if (lifeRatio < 0.5) {
		return 'mediumLife';
	} else if (lifeRatio < 0.75) {
		return 'highLife';
	} else {
		return 'veryHighLife';
	}
}



/**
*	List of messages that can be displayed during the game.
*/
gameSurface.MESSAGES = {
	popLimitReached : {
		id : 0, text : 'You need more houses'
	},
	musicEnabled : {
		id : 1, text : 'Music enabled'
	},
	musicDisabled : {
		id : 2, text : 'Music disabled'
	}
};


/**
*	Shows a message then disappear.
*/
gameSurface.showMessage = function (message, color) {
	$('#messages').removeClass('hide');
	var date = new Date();
	$('#messages').append('<div>' + date.getHours() + ':' + date.getMinutes() + ':' + (date.getSeconds() < 10 ? '0':'') + date.getSeconds() + '<span class="' + (color == null ? 'white': color) + '">' + message.text + '</span></div>')
				.scrollTop(10000);
}


/**
*	Initializes movement extrapolation for one unit.
*/
gameSurface.extrapol = function (model, dx, dy) {
	model.ex = dx;
	model.ey = dy;
	model.et = this.MOVEMENT_EXTRAPOLATION_ITERATION;
	this.ex.push(model);
}


/**
*	Extrapolates units' movement.
*/
gameSurface.updateMoveExtrapolation = function () {
	var index = this.ex.length;
	while (index --) {
		var model = this.ex[index];
		model.position.x += model.ex * this.PIXEL_BY_NODE / this.MOVEMENT_EXTRAPOLATION_ITERATION;
		model.position.y += model.ey * this.PIXEL_BY_NODE / this.MOVEMENT_EXTRAPOLATION_ITERATION;
			
		model.et -= 1;

		var element = utils.getElementFromId(model.elementId);
		if (model.et <= 0 && element != null) {
			this.setElementPosition(model, element.p.x, element.p.y);
			model.et = 0;
			model.ex = 0;
			model.ey = 0;
			this.ex.splice(index, 1);
		}
	}
}
var GUI = {};


/**
*	Current toolbar.
*	It contains the buttons to be shown to the user.
*/
GUI.toolbar = [];


/**
*	CONSTANTS
*/
GUI.IMAGES_PATH = 'img/GUI/';
GUI.MOUSE_ICONS = {
	standard : 'url("' + GUI.IMAGES_PATH + 'cursor.png"), auto', 
	select : 'url("' + GUI.IMAGES_PATH + 'cursor_hover.png"), auto',
	attack : 'url("' + GUI.IMAGES_PATH + 'cursor_attack.png"), auto',
	cross : 'url("' + GUI.IMAGES_PATH + 'cursor_cross.png"), auto',
	crossHover : 'url("' + GUI.IMAGES_PATH + 'cursor_cross_hover.png"), auto',
	arrowTop : 'url("' + GUI.IMAGES_PATH + 'cursor_v.png"), auto',
	arrowTopRight : 'url("' + GUI.IMAGES_PATH + 'cursor_sw.png"), auto',
	arrowTopLeft : 'url("' + GUI.IMAGES_PATH + 'cursor_se.png"), auto',
	arrowBottom : 'url("' + GUI.IMAGES_PATH + 'cursor_v.png"), auto',
	arrowBottomRight : 'url("' + GUI.IMAGES_PATH + 'cursor_se.png"), auto',
	arrowBottomLeft : 'url("' + GUI.IMAGES_PATH + 'cursor_sw.png"), auto',
	arrowRight : 'url("' + GUI.IMAGES_PATH + 'cursor_h.png"), auto',
	arrowLeft : 'url("' + GUI.IMAGES_PATH + 'cursor_h.png"), auto'
}
GUI.UPDATE_FREQUENCY = 0.2;
GUI.GUI_ELEMENTS = {
	none : 0,
	bottomBar: 1,
	minimap: 2
}


/**
*	Show the buildings the player can build. 
*/
GUI.showBuildings = false;
GUI.minimapSize = 0;


/**
*	Initializes the GUI by creating the html elements.
*/
GUI.init = function () {

	this.initMinimapSize();
	this.initResourcesBar();
	this.initCommonButtonsEvents();
	this.initSpecialButtons();
	this.initInfobarEvents();
	$('#gui').tooltip({
	    selector: '.enableTooltip'
	});
	$.extend($.fn.tooltip.defaults, {
    	animation: false,
    	html: true
	});
}


/**
*	Updates the GUI.
*	Called in the main thread.
*/
GUI.update = function () {

	this.updatePopulation();
	this.updateResources();
	this.updateToolbar();
	this.updateInfoBar();

}


/**
*	Initialization methods.
*/
GUI.initResourcesBar = function () {
	for (var i in gameData.RESOURCES) {
		var resource = gameData.RESOURCES[i];
		$('#topBar').append('<div id="resource' + resource.id + '"><div class="sprite"></div><span>0</span></div>');
	}
}
GUI.initCommonButtonsEvents = function () {
	$('#attackButton').click(function () {
		userInput.enterAttackMode();
	});
	$('#stopButton').click(function () {
		userInput.pressStopKey();
	});
	$('#holdButton').click(function () {
		userInput.pressHoldKey();
	});
	$('#patrolButton').click(function () {
		userInput.enterPatrolMode();
	});
}
GUI.initSpecialButtons = function () {
	$('#specialButtons').on('click', 'button', function () {
		if (!$(this).hasClass('disabled')) {
			var buttonId = $(this).attr('data-id');
			userInput.clickSpecialButton(buttonId);	
		}
	});
	$('#queueBuilding').on('click', 'button', function () {
		var buttonId = $(this).attr('data-id');
		userInput.cancelQueue(buttonId);
	});
}
GUI.initInfobarEvents = function () {
	$('#listSelected').on('click', 'button', function (e) {
		var elementId = parseInt($(this).attr('data-id'));
		if (e.ctrlKey && gameContent.selected.indexOf(elementId) > -1) {
			gameContent.selected.splice(gameContent.selected.indexOf(elementId), 1);
			gameSurface.unselectElement(elementId);
		} else {
			if (gameContent.selected.length == 1) {
				gameSurface.centerCameraOnElement(utils.getElementFromId(elementId));
			} else {
				gameSurface.unselectAll();
				gameContent.selected = [elementId];
				gameSurface.selectElement(elementId);
			}
		}
	});
	
	// TODO
}
GUI.initMinimapSize = function () {
	var minimap = document.getElementById('minimap');
	this.minimapSize = 0.12 * window.innerWidth;
}


/**
*	Update methods.
*/
GUI.updatePopulation = function () {
	var player = gameContent.players[gameContent.myArmy];
	$('span', '#population').html(player.pop.current + ' / ' + player.pop.max);
}
GUI.updateResources = function () {
	var player = gameContent.players[gameContent.myArmy];
	for (var i in gameData.RESOURCES) {
		var resource = gameData.RESOURCES[i]; 
		$('span', '#resource' + resource.id).html(player.re[resource.id]);
	}
}
GUI.updateInfoBar = function () {
	if (gameContent.selected.length > 0) {

		// update list selected
		$.each($('button', '#listSelected'), function () {
			if(gameContent.selected.indexOf(parseInt($(this).attr('data-id'))) == -1) {
				$(this).remove();
			}
		});
		for (var i in gameContent.selected) {
			var element = utils.getElementFromId(gameContent.selected[i]);
			var elementData = tools.getElementData(element);

			var guiElement = $('button[data-id="' + element.id + '"]', '#listSelected');
			if (guiElement.length == 0) {
				$('#listSelected').append('<button data-id="' + element.id + '" class="' + gameSurface.getLifeBarBackgroundColor(element.l / elementData.l) + '"><div class="' + elementData.g + ' sprite"></div></button>');
			} else {
				guiElement.attr('class', gameSurface.getLifeBarBackgroundColor(element.l / elementData.l));
			}	
		}

		// update info
		var element = utils.getElementFromId(gameContent.selected[0]);
		var elementData = tools.getElementData(element);

		// common info
		$('#nameElement').html(elementData.name);


		if (element.f == gameData.FAMILIES.land) {
			$('#lifeElement').html('');
			$('.landOnly').removeClass('hideI');
			$('.unitOnly').addClass('hideI');
			$('#defenseStat').addClass('hideI');
			// $('#armorTypeStat').addClass('hideI');
			$('#popStat').addClass('hideI');
			$('#queueBuilding').addClass('hideI');
			if (element.t == gameData.RESOURCES.wood.id) {
				$('span', '#resourcesStatWood').html(element.ra);
				$('#resourcesStatWood').removeClass('hideI');
				$('#resourcesStatWater').addClass('hideI');
			} else if (element.t == gameData.RESOURCES.water.id){
				$('span', '#resourcesStatWater').html(element.ra);
				$('#resourcesStatWood').addClass('hideI');
				$('#resourcesStatWater').removeClass('hideI');
			} else {
				$('#resourcesStatWood').addClass('hideI');
				$('#resourcesStatWater').addClass('hideI');
			}
		} else {
			$('.landOnly').addClass('hideI');

			$('#lifeElement').html(element.l + '/' + elementData.l).attr('class', gameSurface.getLifeBarBackgroundColor(element.l / elementData.l) + ' stat');
			// $('#armorTypeStat').html(elementData.armorType).removeClass('hideI');
			$('span', '#popStat').html(elementData.pop).removeClass('hideI');
			$('span', '#defenseStat').html(accessors.getStat(gameContent.players, element.o, elementData, fightLogic.STATS_BUFF.defense)).removeClass('hideI');

			if (elementData.attack != null) {
				$('.unitOnly').removeClass('hideI');
				$('span', '#fragsStat').html(element.fr);

				$('span', '#attackStat').html(accessors.getStat(gameContent.players, element.o, elementData, fightLogic.STATS_BUFF.attack));
				$('span', '#attackSpeedStat').html(accessors.getStat(gameContent.players, element.o, elementData, fightLogic.STATS_BUFF.attackSpeed));
				$('span', '#rangeStat').html(accessors.getStat(gameContent.players, element.o, elementData, fightLogic.STATS_BUFF.range));
				// $('#weaponTypeStat').html(elementData.weaponType);

			} else {
				$('.unitOnly').addClass('hideI');
			}

			// add queue to buildings
			if (element.f == gameData.FAMILIES.building && rank.isAlly(gameContent.players, gameContent.myArmy, element) && element.q.length > 0) {
				$('button', '#queueBuilding').addClass('hideI');
				for (var i = 0; i < element.q.length; i++) {
					var chibre = element.q[i];
					var q = null;
					if (chibre >= 0) {
						// unit
						var chibron = gameData.ELEMENTS[gameData.FAMILIES.unit][element.r];
						q = chibron[Object.keys(chibron)[chibre]];
					} else {
						// research
						q = tools.getElementDataFrom(gameData.FAMILIES.research, element.r, chibre);
					}
					if (i == 0) {
						// add progression
						$('#queueProgress').html(element.qp + '%');
					}
					$('.sprite:eq(' + i + ')', '#queueBuilding').attr('class', q.g + ' sprite');
					$('button:eq(' + i + ')', '#queueBuilding').removeClass('hideI');
				}
				$('#queueBuilding').removeClass('hideI');
			} else {
				$('button', '#queueBuilding').addClass('hideI');
				$('#queueBuilding').addClass('hideI');
			}
		}

		$('#infoSelected').removeClass('hideI');
	} else {
		if ($('#listSelected').html() != '') {
			$('#listSelected').html('');
		}
		$('#infoSelected').addClass('hideI');
	}
}
GUI.updateToolbar = function () {

	if (gameContent.selected.length > 0 && rank.isAlly(gameContent.players, gameContent.myArmy, utils.getElementFromId(gameContent.selected[0]))) {
		var selected = utils.getElementFromId(gameContent.selected[0]);
		if (selected.f == gameData.FAMILIES.building) {
			$('#commonButtons').addClass('hideI');

			// building(s) are selected
			if (selected.cp < 100) {
				// building is not finished yet, show cancel button
				this.toolbar = [gameData.BUTTONS.cancel];
			} else {
				this.toolbar = production.getWhatCanBeBought(gameContent.players, selected.o, tools.getElementDataFrom(gameData.FAMILIES.building, selected.r, selected.t).buttons);
			}
		} else if (selected.f == gameData.FAMILIES.unit) {

			// unit(s) are selected
			if(this.showBuildings) {
				// show available buildings
				$('#commonButtons').addClass('hideI');
				this.toolbar = this.getBuildingButtons(selected);
			} else {
				// show skills
				$('#commonButtons').removeClass('hideI');
				this.toolbar = tools.getElementDataFrom(gameData.FAMILIES.unit, selected.r, selected.t).buttons;
			}
		}
		$('#specialButtons').removeClass('hideI');
	} else {
		this.toolbar = [];
		$('#commonButtons').addClass('hideI');
		$('#specialButtons').addClass('hideI');
	}

	//hide all the buttons
	$('#specialButtons button').addClass('hide');

	//show or create the required ones.
	for (var i in this.toolbar) {
		var button = this.toolbar[i];
		this.createToolbarButton(button);
	}

}


/**
*	Check if click on minimap or on GUI.
*/
GUI.isGUIClicked = function (x, y) {
	if (y > window.innerHeight - 120 && x < window.innerWidth - this.minimapSize) {
		return this.GUI_ELEMENTS.bottomBar;
	} else if (x > window.innerWidth - this.minimapSize && y > window.innerHeight - this.minimapSize) {
		return this.GUI_ELEMENTS.minimap;
	} else {
		return this.GUI_ELEMENTS.none;
	}
}


/**
*	Minimap actions.
*/
GUI.clickOnMinimap = function (x, y) {
	var moveTo = this.convertToMinimapPosition(x, y);
	gameSurface.centerCameraOnPosition(moveTo);
}
GUI.convertToMinimapPosition = function (x, y) {
	return {
		x: parseInt(gameContent.map.size.x * gameSurface.PIXEL_BY_NODE * (this.minimapSize - window.innerWidth + x) / this.minimapSize),
		y: parseInt(gameContent.map.size.y * gameSurface.PIXEL_BY_NODE * (window.innerHeight - y) / this.minimapSize)
	};
}

GUI.fromRealToMinimapPosition = function (x, y) {
	var pos = {
		x: parseInt(x / (gameContent.map.size.x * gameSurface.PIXEL_BY_NODE) * this.minimapSize),
		y: parseInt(y / (gameContent.map.size.y * gameSurface.PIXEL_BY_NODE) * this.minimapSize)
	};
	if (pos.x < 0) pos.x = 0;
	else if (pos.x > this.minimapSize-1) pos.x = this.minimapSize-1;
	if (pos.y < 0) pos.y = 0;
	else if (pos.y > this.minimapSize-1) pos.y = this.minimapSize-1;
	return pos;
}


/**
*	Returns the list of the buildings which can be built by the builder(s) selected.
*/
GUI.getBuildingButtons = function (builder) {
	return production.getWhatCanBeBought(gameContent.players, builder.o, gameData.ELEMENTS[gameData.FAMILIES.building][builder.r]);
}


/**
*	Updates the mouse icon displayed.
*/
GUI.updateMouse = function (mouseIcon) {
	document.body.style.cursor = mouseIcon;
}


/**
*	Creates a toolbar button.
*/
GUI.createToolbarButton = function (button) {
	if ($('#toolbar' + button.id).html() != null) {
		$('#toolbar' + button.id).removeClass('hide');
	} else {
		// build tooltip
		var tooltip;
		if (button.needs != null && button.needs.length > 0) {
			tooltip = '<p>' + button.name + '</p>';
		} else {
			tooltip = button.name;
		}
		for (var i in button.needs) {
			var need = button.needs[i];
			if (need.t >= 0) {
				tooltip += '<p class="price"><span class="' + gameData.RESOURCES[Object.keys(gameData.RESOURCES)[need.t]].image + ' sprite">&nbsp;</span>' + need.value + '</p>';
			} else {
				tooltip += '<p>' + need.t + '</p>';
			}
		}

		var div = '<button id="toolbar' + button.id + '" data-id="' + button.id + '" class="enableTooltip" data-toggle="tooltip" title=\'' + tooltip + '\'><div class="' + button.g + ' sprite"></div></button>';
		$('#specialButtons').append(div);
	}
	if(!button.isEnabled) {
		$('#toolbar' + button.id).addClass('disabled');
	} else {
		$('#toolbar' + button.id).removeClass('disabled');
	}
}


/**
*	One toolbar button has been selected.
*/
GUI.selectButton = function (button) {
	this.unselectButtons();
	$('#toolbar' + button.buttonId).addClass('selected');
}


/**
*	Unselect all the buttons.
*/
GUI.unselectButtons = function () {
	$('button', '#toolbar').removeClass('selected');
}

var gameManager = {};


/**
*	VARIABLES
*/
gameManager.isOfflineGame = false;
gameManager.offlineGameLoop = 0;
gameManager.musicEnabled = false;


/**
*	Returns player unique id from cookie or create it if it does not exist.
*/
gameManager.getPlayerId = function () {
	var playerId = utils.readCookie('rts_player_id');
	if (playerId == null) {
		var uniqueId = new Date().getTime() + Math.random();
		utils.createCookie('rts_player_id', uniqueId);
		playerId = uniqueId;
	}

	return playerId;
}


/**
*	Returns player unique id from cookie or create it if it does not exist.
*/
gameManager.getPlayerName = function () {
	var playerName = utils.readCookie('rts_player_name');
	if (playerName == null) {
		return 	gameData.getRandomName();
	} else {
		return playerName;
	}
}


/**
*	Updates player's name and updates the cookie.
*/
gameManager.updatePlayerName = function (newName) {
	utils.createCookie('rts_player_name', newName);
	this.playerName = newName;
}


/**
*	Send an order to the game engine.
*/
gameManager.sendOrderToEngine = function (type, params) {
	if (this.isOfflineGame) {
		gameContent.game.orders.push([type, params]);
	} else {
		socketManager.sendOrder(gameContent.gameId, type, params);
	}
}


/**
*	Creates game object from game information.
*/
gameManager.createGameObject = function (playerId, playerName, armyId, mapType, mapSize, initialResources, vegetation, objectives, nbPlayers, iaPlayers) {
	return {
		playerId: playerId,
		playerName: playerName,
		armyId: armyId,
		mapType: mapType,
		mapSize: mapSize,
		initialResources: initialResources,
		vegetation: vegetation,
		objectives: objectives,
		nbPlayers: nbPlayers,
		iaPlayers: iaPlayers
	};
}


/**
*	The user starts a solo game against AI players.
*/
gameManager.startOfflineGame = function (game) {
	this.isOfflineGame = true;

	gameContent.myArmy = game.armyId;
	gameContent.players = [];
	gameContent.players.push(new gameData.Player(0, 0, game.armyId, false));
	gameContent.players[0].n = game.playerName;
	for (var i = 0; i < game.iaPlayers.length; i++) {
		var ownerId= i + 1;
		gameContent.players.push(new gameData.Player(ownerId, ownerId, game.iaPlayers[i], true));
		gameContent.players[ownerId].n = gameData.getRandomName();
	}

	gameContent.map = new gameData.Map(gameData.MAP_TYPES[Object.keys(gameData.MAP_TYPES)[game.mapType]],
		gameData.MAP_SIZES[Object.keys(gameData.MAP_SIZES)[game.mapSize]],
		gameData.VEGETATION_TYPES[Object.keys(gameData.VEGETATION_TYPES)[game.vegetation]],
		gameData.INITIAL_RESOURCES[Object.keys(gameData.INITIAL_RESOURCES)[game.initialResources]],
		game.objectives);
	gameContent.game = gameCreation.createNewGame(gameContent.map, gameContent.players);
	this.waitingData = gameContent.game.gameElements;
	gameSurface.init();
	GUI.init();
}


/**
*	Updates my loading bar and notifies the server in online games.
*/
gameManager.updateLoadingProgress = function (progress) {
	$('.bar', '#loadingProgress').css('width', progress + '%');

	if (this.isOfflineGame || gameContent.isRunning) {
		if (progress >= 100) {
			this.startGame();
		}
	} else {
		if (progress >= 100 || Math.random() < 0.2) {// limits the number of sockets sent
			socketManager.updateLoadingProgress(this.playerId, gameContent.gameId, progress);
		}
	}
}


/**
*	Starts the game.
*/
gameManager.startGame = function () {

	setTimeout(function () {
		// switch screen
		$('#game').removeClass('hide');
		$('#loadingScreen').remove();
	}, 500);

	gameContent.init(this.waitingData);

	if (this.isOfflineGame && this.offlineGameLoop == 0) {
		this.offlineGameLoop = setInterval(function () {
			gameContent.update(gameContent.game.update());
		}, 1000 / gameLogic.OFFLINE_FREQUENCY);

	}
}


/**
*	Updates salon.
*/
gameManager.updateJoinableGamesList = function (data) {

	$('tbody', '#lstGames').html('');
	if (data.games.length > 0) {
		$('.noResult', '#joinGame').addClass('hide');
		$('table', '#joinGame').removeClass('hide');
		for (var i in data.games) {
			var game = data.games[i];
			$('tbody', '#lstGames').append('<tr data-id="' + game.id + '">' 
				+ '<td>'+ game.creatorName + '</td><td>' + game.mapSize + '</td>'
				+ '<td>'+ game.initialResources + '</td><td>' + game.objectives + '</td>'
				+ '<td>' + game.players + '</td></tr>');
		}
	} else {
		$('.noResult', '#joinGame').removeClass('hide');
		$('table', '#joinGame').addClass('hide');
	}

	// confirm join game
	$('tbody tr', '#lstGames').click(function () {
		soundManager.playSound(soundManager.SOUNDS_LIST.mainButton);
		$(this).unbind('click');
		$('.modal').modal('hide');
		showLoadingScreen('Loading');

		var gameId = $(this).attr('data-id');
		var armyId = $('.checked', '#armies').attr('data-army');

		socketManager.joinGame(gameManager.playerId, gameManager.playerName, gameId, armyId);

		removeWebsiteDom();
	});

}


/**
*	The game is full, let's start to load the assets.
*/
gameManager.initOnlineGame = function (data) {
	gameContent.gameId = data.gameId;
	gameContent.players = data.players;
	gameContent.myArmy = data.myArmy;
	gameContent.map = data.map;
	gameContent.isRunning = data.isRunning;
	this.waitingData = data.initElements;
	gameSurface.init();
	GUI.init();
}


/**
*	Updates the loading queue.
*/
gameManager.updateQueue = function (data) {

	$('#playersLoading').removeClass('hide').html('');

	for (var i in data.players) {

		var player = data.players[i];
		if (this.playerId != player.pid) {
			$('#playersLoading').append('<div data-id="' + player.pid + '">'
				+ '<div class="color ' + gameSurface.PLAYERS_COLORS[i] + '">&nbsp;</div>'
				+ '<div class="name">' + player.n + '</div>'
				+ '<div class="progress"><div class="bar" style="width: 0%"></div>'
				+ '</div></div>');
		}

	}
	
}


/**
*	Updates the loading bars of the players. If everybody is ready, starts the game.
*/
gameManager.playersReady = [];
gameManager.updateLoadingQueue = function (data) {

	$('#labelLoading').html('Loading');
	$('.bar', 'div[data-id="' + data.playerId + '"]').css('width', data.loadingProgress + '%');

	if(data.loadingProgress >= 100 && this.playersReady.indexOf(data.playerId) == -1) {
		this.playersReady.push(data.playerId);
	}

	if (this.playersReady.length >= gameContent.players.length) {
		this.startGame();
	}

}


/**
*	Shows the game statistics.
*/
gameManager.showStats = function (playerStatus, gameStats) {

	// show victory / defeat message
	if (playerStatus == gameData.PLAYER_STATUSES.victory) {
		$('#endGameMessage').addClass('victory');
		$('#endGameMessage').html('Victory !');
	} else {
		$('#endGameMessage').addClass('defeat');
		$('#endGameMessage').html('Defeat...');
	}
	$('#endGame').removeClass('hide');

	// show stats
	var dataPopChart = [];
	for (var i in gameStats) {
		var statPlayer = gameStats[i];
		var player = gameContent.players[i];

		var totalTec = [];
		for (var i in player.tec) {
			var tech = player.tec[i];
			if (totalTec.indexOf(tech) == -1) {
				totalTec.push(tech);
			}
		}

		var scoreTotal = stats.getTotalScore(statPlayer, totalTec.length);
		$('tbody', '#endGame').append('<tr class="' + gameSurface.PLAYERS_COLORS[i] + '"><td>' +  
			player.n + '</td><td>' +  
			statPlayer.killed + '</td><td>' +  
			statPlayer.lost + '</td><td>' +  
			statPlayer.buildingsDestroyed + '</td><td>' +  
			statPlayer.unitsCreated + '</td><td>' +  
			statPlayer.resources + '</td><td>' +  
			statPlayer.buildersCreated + '</td><td>' + 
			statPlayer.buildingsCreated + '</td><td>' +  
			totalTec.length + '</td><td>' +  
			scoreTotal + '</td></tr>');

		dataPopChart.push(statPlayer.pop);
	}

	// population chart
	var options = {
		xaxis: {
			show: false
		},
		yaxis: {
			min: 0,
			autoscaleMargin: 1,
			position: 'right',
			tickDecimals: 0
		},
		colors: gameSurface.PLAYERS_COLORS
	};
	$("#popChart").css({
		height: '160px',
		width: window.innerWidth / 2,
		left: window.innerWidth / 4
	});

	$.plot($("#popChart"), dataPopChart, options);
	
}


/**
*	Shows a rejoin notification to the player.
*/
gameManager.askRejoin = function (data) {
	$('#notifications').removeClass('hide').append('<div class="notification rejoin blackBackground">'
		+ 'You were in a game. Do you want to rejoin it ?'
		+ '<div><button class="ok green">Yes</button><button class="no red">No</button></div>'
		+ '</div>');
	$('.ok', '.rejoin').click(function () {
		$(this).unbind('click');
		$('.modal').modal('hide');
		removeWebsiteDom();
		showLoadingScreen('Loading');
		socketManager.rejoinGame(gameManager.playerId, data.gameId);
		$('.rejoin').fadeOut();
	});
	$('.no', '.rejoin').click(function () {
		$('.rejoin').fadeOut();
	});
}
var soundManager = {};


/**
*	CONSTANTS
*/
soundManager.MUSIC_FILES_PATH = 'music/';
soundManager.MUSICS_LIST = ['0', '1'];
soundManager.SOUNDS_LIST = {
	mainButton: 'main_button',
	button: 'button',
	hammer: 'hammer',
	saw: 'saw'
};
soundManager.SOUND_VOLUME = 0.5;


/**
*	VARIABLES
*/
soundManager.audioFilesFormat = null;
soundManager.musicTag = null;
soundManager.soundTag = null;


/**
*	Initializes the sound manager.
*/
soundManager.init = function () {
	try {
		this.musicTag = $('audio', '#musicTags')[0];
		this.soundTag = $('audio', '#musicTags')[1];
		
		if(this.musicTag.canPlayType('audio/ogg') != ''){
	        this.audioFilesFormat = '.ogg';
	    } else if(this.musicTag.canPlayType('audio/mp3') != ''){
	        this.audioFilesFormat = '.mp3';
	    }

	    this.musicTag.addEventListener('ended', function () {
	        soundManager.musicTag.src = null;
	        soundManager.playMusic();
	    });

	    this.soundTag.volume = this.SOUND_VOLUME;
	} catch (e) {
	}
}


/**
*	Plays the music.
*/
soundManager.playMusic = function () {
	if (gameManager.musicEnabled && this.audioFilesFormat != null) {
		if (this.musicTag.src == null || this.musicTag.src == '') {
			this.musicTag.src = this.MUSIC_FILES_PATH + this.getRandomMusic() + this.audioFilesFormat;
		}
		this.musicTag.play();
	}
}


/**
*	Stops the music.
*/
soundManager.stopMusic = function () {
	if (this.audioFilesFormat != null) {
		this.musicTag.pause();
		this.soundTag.pause();
	}
}


/**
*	Plays a sound.
*/
soundManager.playSound = function (filename) {
	if (gameManager.musicEnabled && this.audioFilesFormat != null) {
		this.soundTag.src = this.MUSIC_FILES_PATH + filename + this.audioFilesFormat;
		this.soundTag.play();
	}
}


/**
*	Picks one random music to play.
*/
soundManager.getRandomMusic = function () {
	return this.MUSICS_LIST[parseInt(Math.random() * this.MUSICS_LIST.length)];
}
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
	// this.PAN_LIMITS = [-200, -200, gameContent.map.size.x * gameSurface.PIXEL_BY_NODE + 200, gameContent.map.size.y * gameSurface.PIXEL_BY_NODE + 200];

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
		if (_this.target.x < _this.PAN_LIMITS[0] || _this.target.y < _this.PAN_LIMITS[1]
		 || _this.target.x > _this.PAN_LIMITS[2] || _this.target.y > _this.PAN_LIMITS[3]) {
			return true;
		}
		// if (_this.object.position.x < _this.PAN_LIMITS[0] || _this.object.position.y < _this.PAN_LIMITS[1]
		//  || _this.object.position.x > _this.PAN_LIMITS[2] || _this.object.position.y > _this.PAN_LIMITS[3]) {
		// 	return true;
		// }

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
				userInput.leaveSpecialClickMode();
				
			} else {

				// left click = selection
				userInput.doSelect( event.clientX, event.clientY, event.ctrlKey, event.shiftKey );

			}

		} else if (_state === STATE.ACTION) {

			if (_this.clickMode != _this.MODES.normal) {

				// leave special click mode
				userInput.leaveSpecialClickMode();

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

THREE.TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );var userInput = {};


/**
*	CONSTANTS
*/
userInput.CAN_BE_BUILT_HERE = 10;
userInput.CANNOT_BE_BUILT_HERE = 1;
userInput.DOUBLE_CLICK_RADIUS_SIZE = 15;


/**
*	VARIABLES
*/
userInput.isChatWindowOpen = false;
userInput.hotKeysContent = [[], [], [], [], []];


userInput.doSelect = function (x, y, isCtrlKey, isShiftKey) {

	var clickedPart = GUI.isGUIClicked(x, y);
	if (clickedPart == GUI.GUI_ELEMENTS.bottomBar) {
		return;
	} else if (clickedPart == GUI.GUI_ELEMENTS.minimap) {
		GUI.clickOnMinimap(x, y);
		return;
	}

	// the user is building something
	if (gameContent.building != null) {

		this.tryBuildHere(isShiftKey);
		return false;

	} 

	//the user wants to select one or more elements
	else {

		this.leaveConstructionMode();

		if (!isCtrlKey) {
			// reset selected array
			gameSurface.unselectAll();
			gameContent.selected = [];	
		}
		
		// reset the selection rectangle
		gameContent.selectionRectangle = [];
		gameSurface.updateSelectionRectangle(-1, -1, -1, -1);

		gameContent.selectionRectangle[0] = x;
		gameContent.selectionRectangle[1] = y;

		var intersect = gameSurface.getFirstIntersectObject(x, y);
		if (intersect != null) {

			if (intersect.object.elementId != null) {
				if (isCtrlKey && gameContent.selected.indexOf(intersect.object.elementId) > -1) {
					gameContent.selected.splice(gameContent.selected.indexOf(intersect.object.elementId), 1);
					gameSurface.unselectElement(intersect.object.elementId);
				} else {
					gameContent.selected.push(intersect.object.elementId);
					gameSurface.selectElement(intersect.object.elementId);
				}
			}
		}

		if (gameContent.selected.length > 1) {
			for (var i in gameContent.selected) {
				var sId = '' + gameContent.selected[i];
				if (parseInt(sId.charAt(1)) == gameData.FAMILIES.land) {
					gameSurface.unselectElement(gameContent.selected[i]);
					gameContent.selected.splice(i, 1);
					break; 
				}
			}
		}

	  	return true;

	}
}


userInput.doAction = function (x, y, isShiftKey, specialOrder) {
	
	var clickedPart = GUI.isGUIClicked(x, y);
	if (clickedPart == GUI.GUI_ELEMENTS.bottomBar) {
		return;
	}

	// leave the construction mode if activated
	if(gameContent.building != null) {
		this.leaveConstructionMode();
	} else if(gameContent.selected.length > 0) {

		var selected = utils.getElementFromId(gameContent.selected[0]);
		if (rank.isAlly(gameContent.players, gameContent.myArmy, selected)
			&& (selected.f == gameData.FAMILIES.unit || selected.f == gameData.FAMILIES.building)) {

			var isFromMinimap = false;

			// minimap
			var clickedPart = GUI.isGUIClicked(x, y);
			if (clickedPart == GUI.GUI_ELEMENTS.minimap) {
				var convertedDestination = GUI.convertToMinimapPosition(x, y);
				x = convertedDestination.x;
				y = convertedDestination.y;
				isFromMinimap = true;
			}

			this.dispatchUnitAction(x, y, isShiftKey, specialOrder, isFromMinimap);
		}
	}

}


userInput.doDoubleClick = function (x, y) {

	if(gameContent.selected.length > 0) {

		var selected = utils.getElementFromId(gameContent.selected[0]);
		if(rank.isAlly(gameContent.players, gameContent.myArmy, selected)) {

			var tiles = tools.getTilesAround(gameContent.grid, selected.p, this.DOUBLE_CLICK_RADIUS_SIZE, true);
			for (var i in tiles) {
				if (tiles[i] > 0) {

					var element = utils.getElementFromId(tiles[i]);
					if(gameContent.selected.indexOf(element.id) == -1 && element.f == selected.f && rank.isAlly(gameContent.players, gameContent.myArmy, element) && element.t == selected.t) {

				  		// select the elements
				  		gameContent.selected.push(element.id);
			  	  		gameSurface.selectElement(element.id);

				  	}
				}
			}

		}

	}

}


userInput.pressToolbarShortcut = function (i) {
	// if(i < GUI.toolbar.length) {
	// 	this.clickOnToolbar(GUI.toolbar[i]);
	// }
}


userInput.pressEnterKey = function () {

	if (this.isChatWindowOpen) {

		$('#chat').addClass('hide');
		var message = $('input', '#chat').val();

		if (message != '') {

			if (message == 'olivier !' || message == '/soundon') {

				gameManager.musicEnabled = true;
				soundManager.playMusic();
				gameSurface.showMessage(gameSurface.MESSAGES.musicEnabled);

			} else if (message == 'paranormalement' || message == '/soundoff') {

				gameManager.musicEnabled = false;
				soundManager.stopMusic();
				gameSurface.showMessage(gameSurface.MESSAGES.musicDisabled);

			} else if (message == '/surrender') {

				gameManager.sendOrderToEngine(order.TYPES.surrender, [gameContent.myArmy]);

			} else {

				gameManager.sendOrderToEngine(order.TYPES.chat, [gameContent.myArmy, $('input', '#chat').val()]);

			}

		}

		$('input', '#chat').val('');

	} else {

		$('#chat').removeClass('hide');
		$('#chat').css('top', (window.innerHeight - $('#chat').height()) / 2);
		$('#chat').css('left', (window.innerWidth - $('#chat').width()) / 2);
        $('input', '#chat')[0].focus();

	}

	this.isChatWindowOpen = !this.isChatWindowOpen;

}

userInput.pressSpaceKey = function () {
	if (gameContent.selected.length > 0) {
		gameSurface.centerCameraOnElement(utils.getElementFromId(gameContent.selected[0]));
	}
}


userInput.onMouseMove = function (x, y) {

	this.updateConstructionMode(x, y);
	this.updateMouseIcon(x, y);

}


userInput.onMouseUp = function () {

	this.removeSelectionRectangle();

}












/**
*	The user clicked on a button in the toolbar.
* 	@param button : the button that was clicked
*/
userInput.clickSpecialButton = function (buttonId) {

	soundManager.playSound(soundManager.SOUNDS_LIST.button);
	if (buttonId == gameData.BUTTONS.build.id) {
		// build something
		GUI.showBuildings = true;
	} else if (buttonId == gameData.BUTTONS.back.id) {
		// back button
		GUI.showBuildings = false;
	} else if (buttonId == gameData.BUTTONS.cancel.id) {
		// cancel construction
		gameManager.sendOrderToEngine(order.TYPES.cancelConstruction, [utils.getElementFromId(gameContent.selected[0]).id]);
	} else if (GUI.showBuildings) {
		// building
		var buildings = gameData.ELEMENTS[gameData.FAMILIES.building][gameContent.players[gameContent.myArmy].r];
		var building = buildings[Object.keys(buildings)[('' + buttonId)[2]]];
		this.enterConstructionMode(building);
	}  else if (utils.getElementFromId(gameContent.selected[0]).f == gameData.FAMILIES.building) {
		// buy unit / research
		var family = ('' + buttonId)[0];
		var elementBought;
		if (family == gameData.FAMILIES.unit) {
			// unit
			var units = gameData.ELEMENTS[gameData.FAMILIES.unit][gameContent.players[gameContent.myArmy].r];
			elementBought = units[Object.keys(units)[('' + buttonId)[2]]];
		} else {
			// research
			var researches = gameData.ELEMENTS[gameData.FAMILIES.research][gameContent.players[gameContent.myArmy].r];
			elementBought = researches[('' + buttonId).substring(2)];
		}
		
		gameManager.sendOrderToEngine(order.TYPES.buy, [gameContent.selected, elementBought]);
	}
	
}


/**
*	The user wants to build a construction and has chosen which one. 
* 	@param building : the building selected by the user
*/
userInput.enterConstructionMode = function (building) {
	gameContent.building = building;
	GUI.selectButton(building);
	this.updateConstructionMode(controls.mousePosition.x, controls.mousePosition.y);
}


/**
* 	The user is moving the mouse while in the construction mode.
*		Makes move the building with the mouse and shows if it can be built here. 
* 	@param (x, y) : current coordinates of the mouse
*/
userInput.updateConstructionMode = function (x, y) {
	if(gameContent.building != null) {
		//updates building position
		gameContent.building.p = gameSurface.getAbsolutePositionFromPixel(x, y);

		//check if building can be built here
		gameContent.building.canBeBuiltHere = true;
		for(var i in gameContent.building.shape) {
			for(var j in gameContent.building.shape[i]) {
				gameContent.building.shape[i][j] = this.CAN_BE_BUILT_HERE;
			}
		}
		utils.canBeBuiltHere(gameContent.building);
		gameSurface.updateBuildingGeometry();
	}
}


/**
*	The user does not want anymore to build the building selected.
*/
userInput.leaveConstructionMode = function () {
	gameContent.building = null;
	gameSurface.removeBuildingGeometry();
	GUI.unselectButtons();
	GUI.showBuildings = false;
}


/**
*	Updates the mouse icon.
*/
userInput.updateMouseIcon = function (mouseX, mouseY) {
	var elementUnder = gameSurface.getFirstIntersectObject(mouseX, mouseY);

	var x = - controls.scroll[0];
	var y = controls.scroll[1];
	
	if (elementUnder != null && elementUnder.object.elementId != null) {
		var e = utils.getElementFromId(elementUnder.object.elementId);
		if (controls.clickMode != controls.MODES.normal) {
			GUI.updateMouse(GUI.MOUSE_ICONS.crossHover);
			return;
		} else if (e != null && e.f != gameData.FAMILIES.land && rank.isEnemy(gameContent.players, gameContent.myArmy, e)) {
			GUI.updateMouse(GUI.MOUSE_ICONS.attack);
		} else {
			GUI.updateMouse(GUI.MOUSE_ICONS.select);
		}
	} else if (controls.clickMode != controls.MODES.normal) {
		GUI.updateMouse(GUI.MOUSE_ICONS.cross);
	} else if (!controls.isKeyboardScrolling) {
		if (x > 0 && y > 0) {
			GUI.updateMouse(GUI.MOUSE_ICONS.arrowTopRight);
		} else if (x > 0 && y == 0) {
			GUI.updateMouse(GUI.MOUSE_ICONS.arrowRight);
		} else if (x > 0 && y < 0) {
			GUI.updateMouse(GUI.MOUSE_ICONS.arrowBottomRight);
		} else if (x < 0 && y > 0) {
			GUI.updateMouse(GUI.MOUSE_ICONS.arrowTopLeft);
		} else if (x < 0 && y == 0) {
			GUI.updateMouse(GUI.MOUSE_ICONS.arrowLeft);
		} else if (x < 0 && y < 0) {
			GUI.updateMouse(GUI.MOUSE_ICONS.arrowBottomLeft);
		} else if (x == 0 && y > 0) {
			GUI.updateMouse(GUI.MOUSE_ICONS.arrowTop);
		} else if (x == 0 && y < 0) {
			GUI.updateMouse(GUI.MOUSE_ICONS.arrowBottom);
		} else {
			GUI.updateMouse(GUI.MOUSE_ICONS.standard);
		}
	}
}


/**
*	The user wants to build his construction at the current position.
*/
userInput.tryBuildHere = function (isShiftKey) {
	if(gameContent.building.canBeBuiltHere) {
		soundManager.playSound(soundManager.SOUNDS_LIST.hammer);
		// let's start the construction
		gameManager.sendOrderToEngine(order.TYPES.buildThatHere,
							 [gameContent.selected, gameContent.building, 
							  gameContent.building.p.x, 
							  gameContent.building.p.y, isShiftKey]);
		if (!isShiftKey) {
			this.leaveConstructionMode();
		}
		
	} else {
		// cannot be built here !
	}
}


/**
*	Dispatches the action according to the order.
*/
userInput.dispatchUnitAction = function (x, y, isShiftKey, specialOrder, isFromMinimap) {
	var destination = null;
	if (isFromMinimap) {
		destination = {
			x : parseInt(x / gameSurface.PIXEL_BY_NODE),
			y : parseInt(y / gameSurface.PIXEL_BY_NODE)
		}
	} else {
		var elementUnder = gameSurface.getFirstIntersectObject(x, y);
		if (elementUnder != null) {
			if (elementUnder.object.elementId != null) {
				destination = utils.getElementFromId(elementUnder.object.elementId).p;
				gameSurface.animateSelectionCircle(elementUnder.object.elementId);
			} else {
				destination = {
					x : parseInt(elementUnder.point.x / gameSurface.PIXEL_BY_NODE),
					y : parseInt(elementUnder.point.y / gameSurface.PIXEL_BY_NODE)
				}
			}
		}
	}


	if (destination != null && destination.x >= 0 && destination.y >= 0 && destination.x < gameContent.map.size.x && destination.y < gameContent.map.size.y) {
		gameManager.sendOrderToEngine(order.TYPES.action, [gameContent.selected, destination.x, destination.y, isShiftKey, specialOrder]);
	}
	
}


/**
* 	The user is drawing a selection rectangle to select some elements.
* 	@param (x, y) : current coordinates of the mouse
*/
userInput.drawSelectionRectangle = function (x, y, isCtrlKey) {
	if(gameContent.selectionRectangle.length > 0) {

			// unselect the previous selected elements
			if (!isCtrlKey) {
				gameSurface.unselectAll();
				gameContent.selected = [];
			}

			var nonLandsSelected = false;


			gameSurface.updateSelectionRectangle(gameContent.selectionRectangle[0], gameContent.selectionRectangle[1], x, y);

			var position1 = gameSurface.getFirstIntersectObject(gameContent.selectionRectangle[0], gameContent.selectionRectangle[1]).point;
			var position2 = gameSurface.getFirstIntersectObject(x, y).point;

			var gamePosition1 = gameSurface.convertScenePositionToGamePosition(position1);
			var gamePosition2 = gameSurface.convertScenePositionToGamePosition(position2);
			var selectionRectangleGamePosition = [
				gamePosition1.x, gamePosition1.y, gamePosition2.x, gamePosition2.y
			];

			for (var i = Math.min(selectionRectangleGamePosition[0], selectionRectangleGamePosition[2]); i <= Math.max(selectionRectangleGamePosition[0], selectionRectangleGamePosition[2]); i++) {
				for (var j = Math.min(selectionRectangleGamePosition[1], selectionRectangleGamePosition[3]); j <= Math.max(selectionRectangleGamePosition[1], selectionRectangleGamePosition[3]); j++) {
					if (gameContent.grid[i][j] > 0) {
						var element = utils.getElementFromId(gameContent.grid[i][j]);
						if(rank.isAlly(gameContent.players, gameContent.myArmy, element)) {

							if (!isCtrlKey || gameContent.selected.indexOf(element.id) == -1) {
						  		// select the elements
						  		gameContent.selected.push(element.id);
					  	  		gameSurface.selectElement(element.id);
					  	  		nonLandsSelected = true;
				  	  		}

					  	}
					}
				}
			}

			// unselect the buildings if one or more units are selected
			for (var i in gameContent.selected) {
				var sId = '' + gameContent.selected[i];
				if (sId.charAt(1) == gameData.FAMILIES.unit) {
					
					var len = gameContent.selected.length;
					while(len--) {
						var element = utils.getElementFromId(gameContent.selected[len]);
						if(element.f == gameData.FAMILIES.building) {
							gameContent.selected.splice(len, 1);
					  		gameSurface.unselectElement(element.id);
						}
					}

					break;
				}
			}

			// unselect the lands if one or more elements are selected
			if (nonLandsSelected) {
				var len = gameContent.selected.length;
				while(len--) {
					var element = utils.getElementFromId(gameContent.selected[len]);
					if(element.f == gameData.FAMILIES.land) {
						gameContent.selected.splice(len, 1);
				  		gameSurface.unselectElement(element.id);
					}
				}
			}

		}
}


/**
*	Removes the selection rectangle.
*/
userInput.removeSelectionRectangle = function () {
	gameContent.selectionRectangle = [];
	gameSurface.updateSelectionRectangle(-1, -1, -1, -1);
}


userInput.pressStopKey = function () {
	if (gameContent.selected.length > 0) {
		gameManager.sendOrderToEngine(order.TYPES.stop, [gameContent.selected]);
	}
}


userInput.pressHoldKey = function () {
	if (gameContent.selected.length > 0) {
		gameManager.sendOrderToEngine(order.TYPES.hold, [gameContent.selected]);
	}
}


userInput.enterPatrolMode = function () {
	if (gameContent.selected.length > 0) {
		GUI.unselectButtons();
		$('#patrolButton').addClass('selected');
		controls.clickMode = controls.MODES.patrol;
	}
}


userInput.enterAttackMode = function () {
	if (gameContent.selected.length > 0) {
		GUI.unselectButtons();
		$('#attackButton').addClass('selected');
		controls.clickMode = controls.MODES.attack;	
	}
}


userInput.leaveSpecialClickMode = function () {
	GUI.unselectButtons();
	GUI.updateMouse(GUI.MOUSE_ICONS.standard);
	controls.clickMode = controls.MODES.normal;
}


userInput.pressHotKey = function (index, isCtrlKey) {

	if (isCtrlKey) {

		this.hotKeysContent[index] = [];
		for (var i in gameContent.selected) {
			this.hotKeysContent[index].push(gameContent.selected[i]);	
		}
		

	} else {

		var n = this.hotKeysContent[index].length;
		if (n == 0) { return; }

		while (n--) {
			if (utils.getElementFromId(this.hotKeysContent[index][n]) == null) {
				this.hotKeysContent[index].splice(n, 1);
			}
		}

		if (gameContent.selected.length == this.hotKeysContent[index].length 
			&& this.hotKeysContent[index].indexOf(gameContent.selected[0]) > -1) {
			gameSurface.centerCameraOnElement(utils.getElementFromId(gameContent.selected[0]));
		}

		gameSurface.unselectAll();
		gameContent.selected = [];
		for (var i in this.hotKeysContent[index]) {
			gameContent.selected.push(this.hotKeysContent[index][i]);
			gameSurface.selectElement(this.hotKeysContent[index][i]);
		}

	}

}


/**
*	The user cancelled an unit or a research.
*/
userInput.cancelQueue = function (buttonId) {
	gameManager.sendOrderToEngine(order.TYPES.cancelQueue, [gameContent.selected[0], buttonId]);
}
WaterSurface = function(x, y, detailCoeff, waterTexture, waterTexture2) {
  this.speed = .15;
  this.geometry = new THREE.PlaneGeometry(x, y, 24*detailCoeff, 24*detailCoeff);
  waterTexture.wrapT = waterTexture.wrapS = THREE.RepeatWrapping;
  waterTexture.repeat.set( 32, 32 );
  waterTexture2.wrapT = waterTexture2.wrapS = THREE.RepeatWrapping;
  waterTexture2.repeat.set( 32, 32 );

  this.uniforms = {
    texture: {type: "t", value:waterTexture},
    texture2: {type: "t", value:waterTexture2},
    waveWidth: {type: "f", value: 5},
    waveTime: {type: "f", value: 0},
    textRepeat: {type: "f", value: 32},
  };
  this.attributes = {
    size: { type: 'f', value: [] },
  };

  this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      attributes: this.attributes,
      vertexShader: [
          "uniform float waveWidth;",
          "uniform float waveTime;",
          "uniform float textRepeat;",
          "attribute float size;",

          "varying vec3 vPosition;",
          "varying vec2 vUv;",

          "void main() {",

            "float z = sin(waveWidth * position.y + (waveTime-1.0)*.2) * cos(waveWidth * position.x + waveTime*.6) * 0.1",
            "+ sin(waveWidth * waveTime*.2) * cos(waveWidth * (waveTime+1.0)*.2)*.09",
            "+ sin(waveWidth * waveTime*.2 + size)*.08",
            "+ sin(sqrt(waveWidth * position.x + (waveTime+2.0)) * size*1.0) * cos(sqrt(waveWidth * position.y + waveTime) * size*3.0) * 0.07;",
            "float x = 0.0 + sin(waveWidth * position.x + waveTime/2.0) * 0.12;",
            "float y = 0.0 - sin(waveWidth * position.y + waveTime/2.0) * 0.12;",
            "vPosition = vec3(x, y, z);",
            "vUv = vec2(uv.x * textRepeat + x + sin(waveTime * 0.025), uv.y * textRepeat + y + cos(waveTime * 0.05));",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(vPosition.x, vPosition.y, vPosition.z * 80.0), 1.0);",
          "}",
      ].join("\n"),
      fragmentShader: [
          "uniform sampler2D texture;",
          "uniform sampler2D texture2;",
          "varying vec3 vPosition;",
          "uniform float waveTime;",
          "uniform float textRepeat;",
          "varying vec2 vUv;",

          "void main() {",
              "vec4 texel = texture2D( texture, vUv ) * .6 + texture2D( texture2, vec2(vUv.y, vUv.x) ) * .6;",

             "gl_FragColor = vec4(texel.rgb, 1.0);  // adjust the alpha",
          "}",
      ].join("\n"),
      transparent:false,
  });

  for (var i=0; i<this.geometry.vertices.length; i++) {
      this.attributes.size.value[i] = Math.random() / (detailCoeff*detailCoeff);
  }

  this.model = new THREE.Mesh(this.geometry, this.material);
}

WaterSurface.prototype.animate = function (clockDelta) {
  this.speed += (.5-Math.random())*.02;
  if (this.speed > .2) this.speed = .2;
  if (this.speed < .15) this.speed = .15;
  this.uniforms.waveTime.value += this.speed * clockDelta * 10;
}