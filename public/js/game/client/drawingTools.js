/**
*	Sets the position of an element.
*/
gameSurface.setElementPosition = function (element, x, y) {
	var position = this.convertGamePositionToScenePosition({x : x, y : y});
	element.position.x = position.x;
	element.position.y = position.y;
	var z = this.terrain[parseInt(x * 65 / gameContent.map.size.x)][parseInt(y * 65 / gameContent.map.size.y)];
	element.position.z = Math.abs(z);
}


/**
*	Returns the scene position.
*	@param : gamePosition = {x: xPosition, y : yPosition}
*	@return : scenePosition = {x : ... , y : ..., z : ...}
*/
gameSurface.convertGamePositionToScenePosition = function (gamePosition) {
	return {
		x : gamePosition.x * this.PIXEL_BY_NODE,
		y : gamePosition.y * this.PIXEL_BY_NODE,
		z : 0
	}
}


/**
*	Draws a selection circle.
*/
gameSurface.drawSelectionCircle = function(radius) {
	var material = new THREE.MeshBasicMaterial({
            color: this.SELECTION_COLOR
        });
	var resolution = 100;
	var size = 360 / resolution;
	var geometry = new THREE.Geometry();
	for(var i = 0; i <= resolution; i++) {
	    var segment = ( i * size ) * Math.PI / 180;
	    geometry.vertices.push( new THREE.Vector3( Math.cos( segment ) * radius, 0, Math.sin( segment ) * radius ) );         
	}
 	var cylinder =  new THREE.Line( geometry, material );
 	cylinder.id = 'select';
	return cylinder;
}


/**
*	Updates the target element position.
*/
gameSurface.updateOrderPosition = function () {
	if (gameContent.selected.length > 0 && (gameContent.gameElements[gameContent.selected[0]].s.mt != null
		&& gameContent.gameElements[gameContent.selected[0]].s.mt.x != null || gameContent.gameElements[gameContent.selected[0]].s.rp != null
		|| gameContent.gameElements[gameContent.selected[0]].s.a != null)) {
		var position;
		if (gameContent.gameElements[gameContent.selected[0]].s.a != null) {
			position = gameContent.gameElements[gameContent.selected[0]].s.a.p;
		} else  {
			position = (gameContent.gameElements[gameContent.selected[0]].s.rp != null ? gameContent.gameElements[gameContent.selected[0]].s.rp : gameContent.gameElements[gameContent.selected[0]].s.mt);
		}
		this.setElementPosition(this.order, position.x, position.y);
		this.order.rotation.z += this.ORDER_ROTATION_SPEED;
		this.order.visible = true;
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
		var position = {
			x : Math.min(x1, x2) + dx / 2 + 1,
			y : Math.min(y1, y2) + dy / 2
		};
		this.selectionRectangle.position = this.convertGamePositionToScenePosition(position);
		this.selectionRectangle.scale.x = dx;
		this.selectionRectangle.scale.y = dy;
		this.selectionRectangle.visible = true;
	} else {
		this.selectionRectangle.visible = false;
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
	var element = gameContent.gameElements[elementId].s;
	var elementData = gameData.ELEMENTS[element.f][element.r][element.t];
	gameContent.gameElements[elementId].d.add(this.drawSelectionCircle(elementData.shape.length / 2 * this.PIXEL_BY_NODE / 2));	
}


/**
*	The user unselected an element.
*/
gameSurface.unselectElement = function (elementId) {
	try {
		var d = gameContent.gameElements[elementId].d;
		for (var i in d.children) {
			if (d.children[i].id == 'select') {
				d.remove(d.children[i]);
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
gameSurface.updateOrientation = function (d, element) {
	var s = gameContent.gameElements[element.id].s;
	var dx = element.p.x - s.p.x;
	var dy = element.p.y - s.p.y;
	if (dx == 0 && dy < 0) {
	} else if (dx > 0 && dy < 0) {
		d.rotation.y = this.de2ra(-45);
	} else if (dx > 0 && dy == 0) {
		d.rotation.y = this.de2ra(-90);
	} else if (dx > 0 && dy > 0) {
		d.rotation.y = this.de2ra(-135);
	} else if (dx == 0 && dy > 0) {
		d.rotation.y = this.de2ra(-180);
	} else if (dx < 0 && dy < 0) {
		d.rotation.y = this.de2ra(-225);
	} else if (dx < 0 && dy == 0) {
		d.rotation.y = this.de2ra(-270);
	} else if (dx < 0 && dy < 0) {
		d.rotation.y = this.de2ra(-315);
	}
}


/**
*	Updates the building geometry.
*/
gameSurface.updateBuildingGeometry = function () {	
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
	this.setElementPosition(this.building, gameContent.building.p.x - parseInt(shape.length / 2), gameContent.building.p.y - parseInt(shape.length / 2));
	this.building.visible = true;
}


/**
*	Hides the building geometry.
*/
gameSurface.removeBuildingGeometry = function () {
	this.building.visible = false;
}


/**
*	Animates the selection circle of an element.
*/
gameSurface.animateSelectionCircle = function (elementId) {
	this.selectElement(elementId);
	var d = gameContent.gameElements[elementId].d;
	var target;
	for (var i in d.children) {
		if (d.children[i].id == 'select') {
			target = d.children[i];
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