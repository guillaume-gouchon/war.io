/**
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
			this.order.rotation.z += gameSurface.ORDER_ROTATION_SPEED;
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
