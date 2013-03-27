var gameSurface = {};


gameSurface.init = function () {
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);

	this.projector = new THREE.Projector();
	
	document.body.appendChild(renderer.domElement);

	camera.position.x = gameContent.map.size.x / 2 * this.PIXEL_BY_NODE;
	camera.position.y = gameContent.map.size.y / 2 * this.PIXEL_BY_NODE;
	camera.position.z = 250;

	this.camera = camera;
	this.scene = scene;

	this.getWindowSize();
	this.initContent();

	this.selectionRectangle = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), gameSurface.rectangleSelectionMaterial);
    this.selectionRectangle.dynamic = true;
    //this.selectionRectangle.visible = false;
    scene.add(this.selectionRectangle);

	function render() {
		requestAnimationFrame(render);

		gameSurface.updateGameWindow();
		GUI.update();
		
		renderer.render(scene, camera);
	}

	render();
}

gameSurface.initContent = function () {
	this.plane = new THREE.Mesh(new THREE.PlaneGeometry(gameContent.map.size.x * this.PIXEL_BY_NODE, gameContent.map.size.y * this.PIXEL_BY_NODE), new THREE.MeshBasicMaterial({
            color: 0xaaffaa
    }));
    this.plane.position.x = gameContent.map.size.x * this.PIXEL_BY_NODE / 2 - 5;
    this.plane.position.y = gameContent.map.size.y * this.PIXEL_BY_NODE / 2;
    this.plane.overdraw = true;
    this.scene.add(this.plane);

	gameSurface.rectangleSelectionMaterial = new THREE.LineBasicMaterial({
	        color: 0xddddff,
	});

	gameSurface.selectionColor = new THREE.LineBasicMaterial({
	        color: 0xff0000,
	});

	this.material = new THREE.MeshBasicMaterial({color: 0x00ff00});
}


gameSurface.updateZoom = function (dz) {
	if (this.camera.position.z - dz * 10 <= 250 && this.camera.position.z - dz * 10 >= 100) {
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
	if(this.camera.position.x + this.scroll.dx >= 0 && this.camera.position.x + this.scroll.dx <= gameContent.map.size.x * this.PIXEL_BY_NODE) {
		this.camera.position.x += this.scroll.dx;	
	} else {
		this.scroll.dx = 0;
	}

	if(this.camera.position.y + this.scroll.dy >= 0 && this.camera.position.y + this.scroll.dy <= gameContent.map.size.y * this.PIXEL_BY_NODE) {
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
	this.scene.remove(this.selectionRectangle);
	var geometry = new THREE.CubeGeometry(gameSurface.PIXEL_BY_NODE * Math.abs(x1 - x2), gameSurface.PIXEL_BY_NODE * Math.abs(y1 - y2), 3 * gameSurface.PIXEL_BY_NODE);
	this.selectionRectangle = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial( { color: 0xaaff00, opacity: 0.5, transparent: true } ));

	this.selectionRectangle.position.x = (Math.min(x1, x2) + Math.abs(x1 - x2) / 2 + 1) * this.PIXEL_BY_NODE;
	this.selectionRectangle.position.y = (Math.min(y1, y2) + Math.abs(y1 - y2) / 2 - 2) * this.PIXEL_BY_NODE;
	this.selectionRectangle.geometry = geometry;

	if(x1 == 0 && y1 == 0 && x2 == 0 && y2 == 0) {
		this.selectionRectangle.visible = false;
	} else {
		this.selectionRectangle.visible = true;
	}

	this.selectionRectangle.__dirtyVertices = true;
	this.scene.add(this.selectionRectangle);
}


gameSurface.addElement = function (element) {
	var shape =  gameData.ELEMENTS[element.f][element.r][element.t].shape;
	var geometry = new THREE.CubeGeometry(gameSurface.PIXEL_BY_NODE * shape[0].length, gameSurface.PIXEL_BY_NODE * shape.length, 3 * gameSurface.PIXEL_BY_NODE);
	var cube = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: element.c}));
	cube.position.x = (element.p.x + 1) * gameSurface.PIXEL_BY_NODE;
	cube.position.y = (element.p.y + 1) * gameSurface.PIXEL_BY_NODE;
	this.scene.add(cube);
	gameContent.gameElements[element.id] = {d: cube, s : element};
}

gameSurface.removeElement = function (element) {
	this.scene.remove(gameContent.gameElements[element.id].d);
	delete gameContent.gameElements[element.id];
	//check if it was selected
}


gameSurface.updateElement = function (element) {
	var d = gameContent.gameElements[element.id].d;
	d.position.x = (element.p.x + 1) * gameSurface.PIXEL_BY_NODE;
	d.position.y = (element.p.y + 1) * gameSurface.PIXEL_BY_NODE;

	gameContent.gameElements[element.id] = {d: d, s : element};
}


gameSurface.selectElement = function (elementId) {
	gameContent.gameElements[elementId].d.material = this.selectionColor;	
}

gameSurface.unselectElement = function (elementId) {
	gameContent.gameElements[elementId].d.material = new THREE.MeshBasicMaterial({color: gameContent.gameElements[elementId].s.c});	
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