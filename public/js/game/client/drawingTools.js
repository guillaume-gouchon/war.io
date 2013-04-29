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
*	Converts a game position to a scene position.
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
*	Converts a scene position to a game position.
*	@param : scenePosition = {x: xPosition, y : yPosition}
*	@return : gamePosition = {x : ... , y : ...}
*/
gameSurface.convertScenePositionToGamePosition = function (scenePosition) {
	return {
		x : Math.min(gameContent.map.size.x - 2, Math.max(0, parseInt(scenePosition.x / this.PIXEL_BY_NODE))),
		y : Math.min(gameContent.map.size.y - 2, Math.max(0, parseInt(scenePosition.y / this.PIXEL_BY_NODE)))
	}
}


/**
*	Draws a selection circle.
*/
gameSurface.drawSelectionCircle = function(radius, color) {
	var material = new THREE.MeshBasicMaterial({
            color: color
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
*	Draws a life bar on top of an element.
*/
gameSurface.drawLifeBar = function (element, elementData) {
	var lifeBar = new THREE.Mesh(new THREE.CubeGeometry(this.BARS_DEPTH, this.BARS_HEIGHT, 1), new THREE.MeshBasicMaterial({color: 0xffffff}));
	lifeBar.id = 'life';
	lifeBar.position.x = 0;
	lifeBar.position.y = elementData.height;
	lifeBar.rotation.y = this.de2ra(90);
	this.updateLifeBar(lifeBar, element, elementData);
	return lifeBar;
}


/**
*	Updates the life bar color and size.
*/
gameSurface.updateLifeBar = function (lifeBar, element, elementData) {
	var lifeRatio = element.l / elementData.l;
	lifeBar.scale.z = elementData.shape.length / 3 * this.PIXEL_BY_NODE * element.l / elementData.l;
	lifeBar.material.color.setHex(this.getLifeBarColor(lifeRatio));
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
			y : Math.min(y1, y2) + dy / 2,
			z : 0
		};
		this.selectionRectangle.position = position;
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
	var color;
	if (rank.isEnemy(gameContent.players, gameContent.myArmy, element)) {
		color = this.SELECTION_ENEMY_COLOR;
	} else if (rank.isAlly(gameContent.players, gameContent.myArmy, element)) {
		color = this.SELECTION_ALLY_COLOR;
	} else {
		color = this.SELECTION_NEUTRAL_COLOR;
	}

	var d = gameContent.gameElements[elementId].d;
	d.add(this.drawSelectionCircle(elementData.shape.length / 2 * this.PIXEL_BY_NODE / 2, color));
	
	if (element.f != gameData.FAMILIES.terrain) {
		var lifeBar = this.drawLifeBar(element, elementData);
		lifeBar.rotation.y = - d.rotation.y + this.de2ra(90);
		d.add(lifeBar);
	}
}


/**
*	The user unselected an element.
*/
gameSurface.unselectElement = function (elementId) {
	try {
		var d = gameContent.gameElements[elementId].d;
		var index = d.children.length;
		while (index --) {
			var child = d.children[index];
			if (child.id == 'select' || child.id == 'life') {
				d.remove(child);
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
*	List of messages that can be displayed during the game.
*/
gameSurface.MESSAGES = {
	popLimitReached : {
		id : 0, text : 'You need more houses'
	}
};


/**
*	Shows a message then disappear.
*/
gameSurface.showMessage = function (message, color) {
	if ($('#message' + message.id).length == 0) {
		$('#messages').append('<div><div id="message' + message.id + '" class="fadeOut easeTransition">' + message.text + '</div></div>');
		if (color == null) {
			$('#message' + message.id).css('background', 'white');
		} else {
			$('#message' + message.id).css('background', color);
		}
		var tweenFadeIn = new TWEEN.Tween({alpha:0}).to({alpha:1}, 100)
		.onComplete(function () {
			$('#message' + message.id).removeClass('fadeOut');
		}).start();
		var tweenFadeOut = new TWEEN.Tween({alpha:0}).to({alpha:1}, 8000)
		.onComplete(function () {
			$('#message' + message.id).addClass('fadeOut');
		});
		var tweenHide = new TWEEN.Tween({alpha:0}).to({alpha:1}, 500)
		.onComplete(function () {
			$('#message' + message.id).parent('div').remove();
		});
		tweenFadeIn.chain(tweenFadeOut);
		tweenFadeOut.chain(tweenHide);
	}
}


/**
*	Initializes movement extrapolation for one unit.
*/
gameSurface.extrapol = function (d, dx, dy) {
	d.ex = dx;
	d.ey = dy;
	d.et = this.MOVEMENT_EXTRAPOLATION_ITERATION;
	this.ex.push(d);
}


/**
*	Extrapolates units' movement.
*/
gameSurface.updateMoveExtrapolation = function () {
	var index = this.ex.length;
	while (index --) {
		var d = this.ex[index];
		d.position.x += d.ex * this.PIXEL_BY_NODE / this.MOVEMENT_EXTRAPOLATION_ITERATION;
		d.position.y += d.ey * this.PIXEL_BY_NODE / this.MOVEMENT_EXTRAPOLATION_ITERATION;
			
		d.et -= 1;

		if (d.et <= 0) {
			var element = gameContent.gameElements[d.elementId].s;
			this.setElementPosition(d, element.p.x, element.p.y);
			d.et = 0;
			d.ex = 0;
			d.ey = 0;
			this.ex.splice(index, 1);
		}
	}
}