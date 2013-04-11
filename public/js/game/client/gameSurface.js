var gameSurface = {};

gameSurface.IMG_PATH = 'js/game/data/g/';


gameSurface.init = function () {
	$('#loadingLabel').html('Loading');
	var scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 600);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);

	this.projector = new THREE.Projector();
	
	document.body.appendChild(renderer.domElement);

	camera.position.x = gameContent.map.size.x / 2 * this.PIXEL_BY_NODE;
	camera.position.y = gameContent.map.size.y / 2 * this.PIXEL_BY_NODE;
	camera.position.z = 200;

	this.camera = camera;
	this.scene = scene;
	this.geometries = {};
	this.materials = {};
	this.loader = new THREE.JSONLoader(),
	

	this.getWindowSize();
	this.initContent();

	this.initObjects();

	function render() {
		requestAnimationFrame(render);

		gameSurface.updateGameWindow();
		gameSurface.updateOrder();
		GUI.update();
		
		renderer.render(scene, camera);
	}

	render();

	window.addEventListener('resize', this.onWindowResize, false);
}

gameSurface.updateOrder = function () {
	if (gameContent.selected.length > 0 && (gameContent.gameElements[gameContent.selected[0]].s.mt != null
		&& gameContent.gameElements[gameContent.selected[0]].s.mt.x || gameContent.gameElements[gameContent.selected[0]].s.rp != null)){
		var pos = (gameContent.gameElements[gameContent.selected[0]].s.rp != null ? gameContent.gameElements[gameContent.selected[0]].s.rp : gameContent.gameElements[gameContent.selected[0]].s.mt);
		this.order.position.x = pos.x * this.PIXEL_BY_NODE;
		this.order.position.y = pos.y * this.PIXEL_BY_NODE;
		var z = this.terrain[parseInt(pos.x * 65 / gameContent.map.size.x)][parseInt(pos.y * 65 / gameContent.map.size.y)];
		this.order.position.z = Math.abs(z);
		this.order.rotation.z += 1/20;
		this.order.visible = true;
	} else if (this.order.visible) {
		this.order.visible = false;
	}
}

gameSurface.drawSelectionCircle = function(radius) {
	var material = new THREE.MeshBasicMaterial({
            color: '#0f0'
        });
 	var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 1,  radius, true), material);
 	cylinder.position.z = -6;
 	cylinder.id = 'select';
	return cylinder;
}

gameSurface.initContent = function () {
	this.order = new THREE.Mesh(new THREE.CubeGeometry(5, 5, 5), new THREE.MeshBasicMaterial({color: 0xff0000}));
	this.order.visible = false;
	this.scene.add(this.order);

	var plane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshBasicMaterial({ color: '#000', wireFrame : true }));
	plane.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
    plane.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
    plane.position.z = -12;
    plane.overdraw = true;
	this.scene.add(plane);

	var terrainGeneration = new TerrainGeneration(gameContent.map.size.x * this.PIXEL_BY_NODE, gameContent.map.size.y * this.PIXEL_BY_NODE, 64, 10);
	this.terrain = terrainGeneration.diamondSquare();
	this.geometry = new THREE.PlaneGeometry(gameContent.map.size.x * this.PIXEL_BY_NODE, gameContent.map.size.y * this.PIXEL_BY_NODE, 64, 64);
	var index = 0;
	for(var i = 0; i <= 64; i++) {
		for(var j = 0; j <= 64; j++) {
			//this.geometry.vertices[index].z = this.terrain[i][j];
			index++;
		}
	}


	var grass  = THREE.ImageUtils.loadTexture(this.IMG_PATH + 'grass.png');
	grass.wrapT = grass.wrapS = THREE.RepeatWrapping;
	var material = new THREE.MeshBasicMaterial({ map: grass });

	var plane = new THREE.Mesh(this.geometry, material);
    plane.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
    plane.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
    plane.overdraw = true;
    this.scene.add(plane);

	gameSurface.selectionColor = new THREE.LineBasicMaterial({
	        color: 0xff0000,
	});

	this.material = new THREE.MeshBasicMaterial({color: 0x00ff00});

	var geometry = new THREE.CubeGeometry(this.PIXEL_BY_NODE, this.PIXEL_BY_NODE, 4 * this.PIXEL_BY_NODE);
	this.selectionRectangle = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial( { color: 0xaaff00, opacity: 0.5, transparent: true } ));
	this.scene.add(this.selectionRectangle);

	this.canBuildHereMaterial = new THREE.LineBasicMaterial({color: 0x00ff00, opacity: 0.5, transparent: true });
	this.cannotBuildHereMaterial = new THREE.LineBasicMaterial({color: 0xff0000, opacity: 0.5, transparent: true });
	this.basicCubeGeometry = new THREE.CubeGeometry(this.PIXEL_BY_NODE, this.PIXEL_BY_NODE, this.PIXEL_BY_NODE);
}


gameSurface.updateZoom = function (dz) {
	if (this.camera.position.z - dz * 10 <= 200 && this.camera.position.z - dz * 10 >= 50) {
		this.camera.position.z -= dz * 10;
		if(dz < 0) {
			this.camera.rotation.x -= 0.1;
		} else {
			this.camera.rotation.x += 0.1;
		}
	}
}

gameSurface.PIXEL_BY_NODE = 10;

/**
*	Handles the window scrolling.
*/
gameSurface.scroll = {
	dx : 0,
	dy : 0
}
gameSurface.MAP_SCROLL_SPEED = 20;
/**
*	Map navigation
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


gameSurface.updateGameWindow = function () {
	if(this.camera.position.x + this.scroll.dx >= 0 && this.camera.position.x + this.scroll.dx <= gameContent.map.size.x * this.PIXEL_BY_NODE - this.width / 4) {
		this.camera.position.x += this.scroll.dx;	
	} else {
		this.scroll.dx = 0;
	}

	if(this.camera.position.y + this.scroll.dy >= 0 && this.camera.position.y + this.scroll.dy <= gameContent.map.size.y * this.PIXEL_BY_NODE - this.height / 4) {
		this.camera.position.y += this.scroll.dy;
	} else {
		this.scroll.dy = 0;
	}
	
}

gameSurface.getWindowSize = function () {
	var winW, winH;
	if (document.body && document.body.offsetWidth) {
		winW = document.body.offsetWidth;
		winH = document.body.offsetHeight;
	} else if (document.compatMode=='CSS1Compat' &&
	    document.documentElement &&
	    document.documentElement.offsetWidth ) {
		winW = document.documentElement.offsetWidth;
		winH = document.documentElement.offsetHeight;
	} else {
		winW = window.innerWidth;
		winH = window.innerHeight;
	}

	this.height = winH;
	this.width = winW;
}


gameSurface.updateSelectionRectangle = function (x1, y1, x2, y2) {
	if ( Math.abs(x1 - x2) > 0 &&  Math.abs(y1 - y2) > 0) {
		this.selectionRectangle.position.x = (Math.min(x1, x2) + Math.abs(x1 - x2) / 2 + 1) * this.PIXEL_BY_NODE;
		this.selectionRectangle.position.y = (Math.min(y1, y2) + Math.abs(y1 - y2) / 2) * this.PIXEL_BY_NODE;
		this.selectionRectangle.scale.x = Math.abs(x1 - x2);
		this.selectionRectangle.scale.y = Math.abs(y1 - y2);
		this.selectionRectangle.visible = true;
	} else {
		this.selectionRectangle.visible = false;
	}
}


gameSurface.addElement = function (element) {
	var elementData = gameData.ELEMENTS[element.f][element.r][element.t];
	this.createObject(elementData.g, element);
}


gameSurface.initObjects = function () {
	for (var i in gameData.ELEMENTS) {
		for (var j in gameData.ELEMENTS[i]) { 
			for (var k in gameData.ELEMENTS[i][j]) {
				var elementData = gameData.ELEMENTS[i][j][k];
				if (this.geometries[elementData.g] == null) {
					this.loadObject(elementData.g);
					this.loadMaterial(elementData.g);
				}
			}
		}
	}
}

gameSurface.loadObject = function (key) {
	this.loader.load(this.IMG_PATH + key, this.objectLoaded(key));
}

gameSurface.loadMaterial = function (key) {
	try {
		this.materials[key] = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture(this.IMG_PATH + key.replace('.js', '.png'))});
	} catch (e) {
	}
}

var i = 0;

gameSurface.objectLoaded = function (key) {
	return function (geometry, materials) {
		i++
		gameSurface.geometries[key] = geometry;
		/*if (materials != null) {
			gameSurface.materials[key] = materials[0];
		}*/
		if(i == 9) {
			gameManager.startGame();
		}
	};
}

gameSurface.createObject = function (key, element) {
	var object = new THREE.Mesh(this.geometries[key], this.materials[key]);

	gameSurface.setElementPosition(object, element.p.x, element.p.y);


	if (key == 'tree.js') {
		object.rotation.x = this.de2ra(90);
		object.rotation.y = this.de2ra(Math.random() * 360);
	} else if ( key == 'castle.js') {
		object.rotation.x = this.de2ra(90);
		object.scale.x = 2;
		object.scale.y = 2;
		object.scale.z = 2;
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
		object.position.z = 5;
		object.rotation.y = this.de2ra(Math.random() * 360);
	}

	if (element.f == gameData.FAMILIES.building && element.cp < 100) {
		object.position.z -= (100 - element.cp) / 20 * this.PIXEL_BY_NODE;
	}

	this.scene.add(object);
	gameContent.gameElements[element.id] = {d: object, s : element};
}

gameSurface.de2ra = function(degree)   { return degree * (Math.PI/180); }

gameSurface.removeElement = function (element) {
	this.scene.remove(gameContent.gameElements[element.id].d);
	delete gameContent.gameElements[element.id];
	//check if it was selected
}


gameSurface.updateElement = function (element) {
	var d = gameContent.gameElements[element.id].d;
	gameSurface.setElementPosition(d, element.p.x, element.p.y);

	if (element.f == gameData.FAMILIES.building) {
		if (element.cp < 100) {
			d.position.z -= (100 - element.cp) / 20 * this.PIXEL_BY_NODE;
		} else if (element.q.length > 0) {
			for (var i in d.children) {
				if (d.children[i].id == 'prog') {
					d.remove(d.children[i]);
				}
			}
			if (element.qp < 100) {
				var progress = new THREE.Mesh(new THREE.CubeGeometry(2, 2, element.qp / 30 * this.PIXEL_BY_NODE), new THREE.MeshBasicMaterial({color: 0xffdd00}));
				progress.id = 'prog';
				progress.position.x = 15 - element.qp / 30 * this.PIXEL_BY_NODE / 2;
				progress.position.y = 25;
				progress.rotation.y = this.de2ra(90);
				d.add(progress);
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


gameSurface.selectElement = function (elementId) {
	var element = gameContent.gameElements[elementId].s;
	var elementData = gameData.ELEMENTS[element.f][element.r][element.t];
	gameContent.gameElements[elementId].d.add(this.drawSelectionCircle(elementData.shape.length / 2 * this.PIXEL_BY_NODE));	
}

gameSurface.unselectElement = function (elementId) {
	var d = gameContent.gameElements[elementId].d;
	for (var i in d.children) {
		if (d.children[i].id == 'select') {
			d.remove(d.children[i]);
		}
	}
}

gameSurface.unselectAll = function () {
	for (var i in gameContent.selected) {
		this.unselectElement(gameContent.selected[i]);
	}
}

gameSurface.getAbsolutePositionFromPixel = function (x, y) {
	var vector = new THREE.Vector3( ( x / window.innerWidth ) * 2 - 1, - ( y / window.innerHeight ) * 2 + 1, 0.5 );
	this.projector.unprojectVector( vector, this.camera );

	var raycaster = new THREE.Raycaster( this.camera.position, vector.sub( this.camera.position ).normalize() );

	var intersects = raycaster.intersectObjects(this.scene.children);

	if ( intersects.length > 0 ) {
		return {x : parseInt(intersects[0].point.x / this.PIXEL_BY_NODE), y : parseInt(intersects[0].point.y / this.PIXEL_BY_NODE)};
	} else {
		return {x : -1, y : -1};
	}
}

gameSurface.setElementPosition = function (d, x, y) {
	d.position.x = (x + 1) * gameSurface.PIXEL_BY_NODE;
	d.position.y = (y - 0) * gameSurface.PIXEL_BY_NODE;
	var z = this.terrain[parseInt(x * 65 / gameContent.map.size.x)][parseInt(y * 65 / gameContent.map.size.y)];
	d.position.z = Math.abs(z);
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


gameSurface.onWindowResize = function() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth - 5, window.innerHeight - 5);

}


gameSurface.buildBuildingGeometry = function () {
	if (gameContent.building != null) {
		this.scene.remove(this.building);
	}
	
	this.building = new THREE.Object3D();

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
			var cube = new THREE.Mesh(this.basicCubeGeometry, material);
			cube.position.x = i * this.PIXEL_BY_NODE;
			cube.position.y = j * this.PIXEL_BY_NODE; 
			this.building.add(cube);	
		}
	}

	this.scene.add(this.building);
}


gameSurface.updateBuilding = function () {
	var shape = gameContent.building.shape;
	var n = 0;
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
			this.building.children[n].material = material;
			n++;
		}
	}

	this.setElementPosition(this.building, gameContent.building.p.x - parseInt(shape.length / 2), gameContent.building.p.y - parseInt(shape.length / 2));
}