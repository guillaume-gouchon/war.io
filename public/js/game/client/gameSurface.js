var gameSurface = {};

var scene, camera;


/**
*	CONSTANTS
*/
gameSurface.NB_GEOMETRIES = 6;
gameSurface.IMG_PATH = 'js/game/data/g/';
gameSurface.PIXEL_BY_NODE = 10;
gameSurface.NEAR = 1;
gameSurface.FAR = 600;
gameSurface.ZOOM_MAX = 30;
gameSurface.ZOOM_MIN = 100;
gameSurface.ZOOM_STEP = 10;
gameSurface.ZOOM_ROTATION_STEP = 0.1;
gameSurface.ORDER_ROTATION_SPEED = 1/20;
gameSurface.FOG_DENSITY = 0.0005;
gameSurface.SELECTION_COLOR = '#0f0';
gameSurface.CAMERA_INIT_ANGLE = 0.7;
gameSurface.ORDER_OPACITY = 0.7;
gameSurface.SELECTION_RECTANGLE_HEIGHT = 4;
gameSurface.SELECTION_RECTANGLE_OPACITY = 0.5;
gameSurface.SELECTION_RECTANGLE_COLOR = 0x000000;
gameSurface.CAN_BUILD_CUBE_COLOR = 0x00ff00;
gameSurface.CANNOT_BUILD_CUBE_COLOR = 0xff0000;
gameSurface.BUILD_CUBE_OPACITY = 0.5;
gameSurface.MAP_SCROLL_SPEED = 10;
gameSurface.MAP_SCROLL_X_MIN = 0;
gameSurface.MAP_SCROLL_Y_MIN = 0;
gameSurface.CENTER_CAMERA_Y_OFFSET = 8;
gameSurface.PROGRESS_BAR_LENGTH = 1;


/**
*	VARIABLES
*/
gameSurface.geometries = null;
gameSurface.materials = null;
gameSurface.terrain = null;
gameSurface.scroll = {dx : 0, dy : 0};
gameSurface.geometriesLoaded = 0;


/**
*	OBJECTS
*/
gameSurface.loader = null;
gameSurface.projector = null;
gameSurface.order = null;
gameSurface.selectionRectangle = null;
gameSurface.canBuildHereMaterial = null;
gameSurface.cannotBuildHereMaterial = null;
gameSurface.basicCubeGeometry = null;
gameSurface.building = null;


/**
*	Initializes the game surface.
*/
gameSurface.init = function () {
	$('#loadingLabel').html('Loading');

	scene = new THREE.Scene();

	//init camera
	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, this.NEAR, this.FAR);
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = this.ZOOM_MIN;
	camera.rotation.x = this.CAMERA_INIT_ANGLE;


	//init fog
	scene.fog = new THREE.Fog( 0xffffff, this.FOG_DENSITY, this.FAR);

	//init renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
	document.body.appendChild(renderer.domElement);

	//init variables
	this.projector = new THREE.Projector();
	this.geometries = {};
	this.materials = {};
	this.loader = new THREE.JSONLoader();

	//init scene
	this.createScene();
	this.init3DModels();

	//add listeners
	window.addEventListener('resize', this.onWindowResize, false);


	function render() {
		requestAnimationFrame(render);

		gameSurface.updateGameWindow();
		gameSurface.updateOrderPosition();
		GUI.update();
		TWEEN.update();
		
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

	/*var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( this.IMG_PATH + 'bleached_right.jpg' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( this.IMG_PATH + 'bleached_left.jpg' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( this.IMG_PATH + 'bleached_front.jpg' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( this.IMG_PATH + 'bleached_back.jpg' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( this.IMG_PATH + 'bleached_top.jpg' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( this.IMG_PATH + 'bleached_top.jpg' ) }));
	for (var i = 0; i < 6; i++)
	   materialArray[i].side = THREE.BackSide;
	var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
	
	var skyboxGeom = new THREE.CubeGeometry( 4000, 4000, 4000, 1, 1, 1 );
	
	var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
	scene.add( skybox );	*/

	//generate the terrain
	var terrainGeneration = new TerrainGeneration(gameContent.map.size.x * this.PIXEL_BY_NODE, gameContent.map.size.y * this.PIXEL_BY_NODE, 64, 10);
	this.terrain = terrainGeneration.diamondSquare();
	var terrainGeometry = new THREE.PlaneGeometry(2000, 2000, 64, 64);
	var index = 0;
	for(var i = 0; i <= 64; i++) {
		for(var j = 0; j <= 64; j++) {
			//terrainGeometry.vertices[index].z = this.terrain[i][j];
			index++;
		}
	}
	var grassTexture  = THREE.ImageUtils.loadTexture(this.IMG_PATH + 'grass.png');
	grassTexture.wrapT = grassTexture.wrapS = THREE.RepeatWrapping;
	var grassMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });
	var planeSurface = new THREE.Mesh(terrainGeometry, grassMaterial);
    planeSurface.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
    planeSurface.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
    planeSurface.overdraw = true;
    scene.add(planeSurface);

	//add order element
	this.order = new THREE.Mesh(new THREE.TorusGeometry(5, 2, 2, 5), new THREE.MeshLambertMaterial({color: 0xff0000, opacity: this.ORDER_OPACITY, transparent: true}));
	this.order.visible = false;
	scene.add(this.order);

	//add selection rectangle
	var geometry = new THREE.CubeGeometry(this.PIXEL_BY_NODE, this.PIXEL_BY_NODE, this.SELECTION_RECTANGLE_HEIGHT * this.PIXEL_BY_NODE);
	this.selectionRectangle = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial( { color: this.SELECTION_RECTANGLE_COLOR, opacity: this.SELECTION_RECTANGLE_OPACITY, transparent: true } ));
	scene.add(this.selectionRectangle);

	//add building geometry
	this.building = new THREE.Object3D();
	this.building.visible = false;
	scene.add(this.building);

	//initialize basic materials and geometries
	this.canBuildHereMaterial = new THREE.LineBasicMaterial({color: this.CAN_BUILD_CUBE_COLOR, opacity: this.BUILD_CUBE_OPACITY, transparent: true });
	this.cannotBuildHereMaterial = new THREE.LineBasicMaterial({color: this.CANNOT_BUILD_CUBE_COLOR, opacity: this.BUILD_CUBE_OPACITY, transparent: true });
	this.basicCubeGeometry = new THREE.CubeGeometry(this.PIXEL_BY_NODE, this.PIXEL_BY_NODE, this.PIXEL_BY_NODE);

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
					this.loadObject(elementData.g);
				}
			}
		}
	}
}


/**
*	Loads the geometry.
*/
gameSurface.loadObject = function (key) {
	this.loader.load(this.IMG_PATH + key, this.objectLoaded(key));
}


/**
*	Callback when a geometry is loaded.
*/
gameSurface.objectLoaded = function (key) {
	return function (geometry, materials) {
		gameSurface.geometries[key] = geometry;
		gameSurface.materials[key] = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture(gameSurface.IMG_PATH + key.replace('.js', '.png'))});
		//TODO : to change to a correct way
		gameSurface.geometriesLoaded ++;
		if(gameSurface.geometriesLoaded == gameSurface.NB_GEOMETRIES) {
			gameManager.startGame();
		}
	};
}


/**
*	Updates the game window position.
*/
gameSurface.updateGameWindow = function () {
	if(camera.position.x + this.scroll.dx >= this.MAP_SCROLL_X_MIN && camera.position.x + this.scroll.dx <= gameContent.map.size.x * this.PIXEL_BY_NODE) {
		camera.position.x += this.scroll.dx;	
	} else {
		this.scroll.dx = 0;
	}
	if(camera.position.y + this.scroll.dy >= this.MAP_SCROLL_Y_MIN && camera.position.y + this.scroll.dy <= gameContent.map.size.y * this.PIXEL_BY_NODE) {
		camera.position.y += this.scroll.dy;
	} else {
		this.scroll.dy = 0;
	}
}


/**
*	Handles the map scrolling.
*/
gameSurface.updateHorizontalScrolling = function (x) {
	this.scroll.dx = x * this.MAP_SCROLL_SPEED;
}
gameSurface.updateVerticalScrolling = function (y) {
	this.scroll.dy = y * this.MAP_SCROLL_SPEED;
}
gameSurface.stopMapScrolling = function () {
	this.updateHorizontalScrolling(0);
	this.updateVerticalScrolling(0);
}


/**
*	The user has just zoomed in/out, it updates the camera.
*/
gameSurface.updateZoom = function (dz) {
	var z = camera.position.z - dz * this.ZOOM_STEP;
	if (z <= this.ZOOM_MIN && z >= this.ZOOM_MAX) {
		camera.position.z = z;
		camera.rotation.x += (dz < 0 ? - this.ZOOM_ROTATION_STEP : this.ZOOM_ROTATION_STEP);
	}
}


/**
*	Called when the user has resized the browser window.
*/
gameSurface.onWindowResize = function() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth - 5, window.innerHeight - 5);
}


/**
*	Adds a new game element.
*/
gameSurface.addElement = function (element) {
	var elementData = gameData.ELEMENTS[element.f][element.r][element.t];
	this.createObject(elementData.g, element);
}


/**
*	Creates the game element's 3D model and adds it to the scene.
*/
gameSurface.createObject = function (key, element) {
	var object = new THREE.Mesh(this.geometries[key], this.materials[key]);
	object.elementId = element.id;
	this.setElementPosition(object, element.p.x, element.p.y);

	if (key == 'tree.js') {
		object.rotation.x = this.de2ra(90);
		object.rotation.y = this.de2ra(Math.random() * 360);
	} else if ( key == 'castle.js') {
		object.rotation.x = this.de2ra(90);
		object.scale.x = 3;
		object.scale.y = 3;
		object.scale.z = 3;
	} else if ( key == 'dwarf.js') {
		object.rotation.x = this.de2ra(90);
		object.scale.x = 2;
		object.scale.y = 2;
	} else if (key == 'stonemine.js') {
		object.rotation.x = this.de2ra(90);
		object.scale.x = 1.2;
		object.scale.y = 1.2;
		object.scale.z = 1.2;
	} else if (key == 'goldmine.js') {
		object.rotation.x = this.de2ra(90);
		object.scale.x = 1.5;
		object.scale.y = 1.5;
		object.scale.z = 1.5;
		object.rotation.y = this.de2ra(Math.random() * 360);
	} else if (key == 'habitation.js') {
		object.rotation.x = this.de2ra(90);
		object.scale.x = 3;
		object.scale.y = 3;
		object.scale.z = 3;
	} else if (key == 'barrack.js') {
		object.rotation.x = this.de2ra(90);
		object.scale.x = 2;
		object.scale.y = 2;
		object.scale.z = 2;
	}

	if (element.f == gameData.FAMILIES.building && element.cp < 100) {
		object.position.z -= (100 - element.cp) / 20 * this.PIXEL_BY_NODE;
	}

	scene.add(object);
	gameContent.gameElements[element.id] = {d: object, s : element};
}


/**
*	Updates an existing game element.
*/
gameSurface.updateElement = function (element) {
	var d = gameContent.gameElements[element.id].d;
	if (element.f == gameData.FAMILIES.unit) {
		this.updateOrientation(d, element);
	
	}
	this.setElementPosition(d, element.p.x, element.p.y);
	
	if (element.f == gameData.FAMILIES.building) {
		if (element.cp < 100) {
			d.position.z -= (100 - element.cp) / 20 * this.PIXEL_BY_NODE;
		} else if (element.q.length > 0) {
			var progressBar = null;
			for (var i in d.children) {
				if (d.children[i].id == 'prog') {
					progressBar = d.children[i];
					break;
				}
			}

			if (progressBar == null) {
				var progress = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0xffffff}));
				progress.id = 'prog';
				progress.position.x = this.PROGRESS_BAR_LENGTH * this.PIXEL_BY_NODE / 2;
				progress.position.y = 18;
				progress.rotation.y = this.de2ra(90);
				d.add(progress);
			} else {
				progressBar.scale.z = element.qp / 100 * this.PROGRESS_BAR_LENGTH * this.PIXEL_BY_NODE;
				progressBar.position.x = this.PROGRESS_BAR_LENGTH * this.PIXEL_BY_NODE / 2 * (1 - element.qp / 100);
			}

		} else {
			for (var i in d.children) {
				if (d.children[i].id == 'prog') {
					d.remove(d.children[i]);
				}
			}
		}
	}

	gameContent.gameElements[element.id] = {d: d, s : element};
}


/**
*	Removes a game element.
*/
gameSurface.removeElement = function (element) {
	scene.remove(gameContent.gameElements[element.id].d);
	//removes from the selected elements if it was
	if (gameContent.selected.indexOf(element.id) >= 0) {
		gameContent.selected.splice(gameContent.selected.indexOf(element.id), 1);
	}
	delete gameContent.gameElements[element.id];
}


/**
*	Returns the game coordinates from some screen coordinates.
*/
gameSurface.getAbsolutePositionFromPixel = function (x, y) {
	var intersect = this.getFirstIntersectObject(x, y);
	if (intersect != null) {
		return {x : parseInt(intersect.point.x / this.PIXEL_BY_NODE), y : parseInt(intersect.point.y / this.PIXEL_BY_NODE)};
	} else {
		return {x : -1, y : -1};
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
	if ( intersects.length > 0 ) {
		return intersects[0];	
	}
	return null;
}


/*
 * @author Sann-Remy Chea / http://srchea.com/
 * Generate a random terrain using the diamond-square algorithm
 */

TerrainGeneration = function(width, height, segments, smoothingFactor) {
	this.width = width;
	this.height = height;
	this.segments = segments;
	this.smoothingFactor = smoothingFactor;
	
	this.terrain = new Array();
	
	// internal functions
	this._init = function() {
		this.terrain = new Array();
		for(var i = 0; i <= this.segments; i++) {
			this.terrain[i] = new Array();
			for(var j = 0; j <= this.segments; j++) {
				this.terrain[i][j] = 0;
			}
		}
	};
	
	this.diamondSquare = function() {
		this._init();
		
		var size = this.segments+1;
		for(var length = this.segments; length >= 2; length /= 2) {
			var half = length/2;
			this.smoothingFactor /= 2;

			// generate the new square values
			for(var x = 0; x < this.segments; x += length) {
				for(var y = 0; y < this.segments; y += length) {
					var average = this.terrain[x][y]+ // top left
					this.terrain[x+length][y]+ // top right
					this.terrain[x][y+length]+ // lower left
					this.terrain[x+length][y+length]; // lower right
					average /= 4;
					average += 2*this.smoothingFactor*Math.random()-this.smoothingFactor;
					
					this.terrain[x+half][y+half] = average;
				}
			}

			// generate the diamond values
			for(var x = 0; x < this.segments; x += half) {
				for(var y = (x+half)%length; y < this.segments; y += length) {
					var average = this.terrain[(x-half+size)%size][y]+ // middle left
							this.terrain[(x+half)%size][y]+ // middle right
							this.terrain[x][(y+half)%size]+ // middle top
							this.terrain[x][(y-half+size)%size]; // middle bottom
					average /= 4;
					average += 2*this.smoothingFactor*Math.random()-this.smoothingFactor;
					
					this.terrain[x][y] = average;

					// values on the top and right edges
					if(x === 0)
						this.terrain[this.segments][y] = average;
					if(y === 0)
						this.terrain[x][this.segments] = average;
				}
			}
		}
		return this.terrain;
	};
};


/**
*	Centers game window on element.
*/
gameSurface.centerCameraOnElement = function (element) {
	var position = this.convertGamePositionToScenePosition(element.p);
	camera.position.x = position.x;
	camera.position.y = position.y - this.CENTER_CAMERA_Y_OFFSET * this.PIXEL_BY_NODE;
}