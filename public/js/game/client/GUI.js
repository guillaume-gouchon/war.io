var GUI = {};


/**
*	Current toolbar.
*	It contains the buttons to be shown to the user.
*/
GUI.toolbar = [];


/**
*	CONSTANTS
*/
GUI.BUTTONS_SIZE = 70;
GUI.TOOLBAR_BUTTONS = {
	build : {buttonId : 1000, image : 'build.png', isEnabled : true, name: 'Build'},
	cancel : {buttonId : 1001, image : 'cancel.png', isEnabled : true, name: 'Cancel'}
}
GUI.MOUSE_ICONS = {
	standard : 'url("js/game/data/g/cursor.png"), auto', 
	select : 'url("js/game/data/g/cursor_hover.png"), auto',
	attack : 'url("js/game/data/g/cursor_attack.png"), auto',
	arrowTop : 'n-resize',
	arrowTopRight : 'ne-resize',
	arrowTopLeft : 'nw-resize',
	arrowBottom : 's-resize',
	arrowBottomRight : 'se-resize',
	arrowBottomLeft : 'sw-resize',
	arrowRight : 'e-resize',
	arrowLeft : 'w-resize'
}


/**
*	Show the buildings the player can build. 
*/
GUI.showBuildings = false;


/**
*	Initializes the GUI by creating the html elements.
*/
GUI.init = function () {
	this.createResourcesBar();
	this.initInfobar();
	this.initMinimap();
}


/**
*	Updates the GUI.
*	Called in the main thread.
*/
GUI.update = function () {
	this.updatePopulation();
	this.updateResources();
	this.updateToolbar();
	this.updateInfo();
	this.updateMinimap();
}


/**
*	Updates the toolbar depending on the elements selected.
*/
GUI.updateToolbar = function () {
	if (gameContent.selected.length > 0 && rank.isAlly(gameContent.players, gameContent.myArmy, gameContent.gameElements[gameContent.selected[0]].s)) {
		var selected = gameContent.gameElements[gameContent.selected[0]].s;
		if (selected.f == gameData.FAMILIES.building) {
			//building(s) are selected
			if (selected.cp < 100) {
				//building is not finished yet, show cancel button
				this.toolbar = [GUI.TOOLBAR_BUTTONS.cancel];
			} else {
				this.toolbar = production.getWhatCanBeBought(gameContent.players, selected.o, gameData.ELEMENTS[gameData.FAMILIES.building][selected.r][selected.t].buttons);
			}
		} else if (selected.f == gameData.FAMILIES.unit) {
			//unit(s) are selected
			if(this.showBuildings) {
				this.toolbar = this.getBuildingButtons(selected);
			} else {
				this.toolbar = gameData.ELEMENTS[gameData.FAMILIES.unit][selected.r][selected.t].buttons;
			}
		}
	} else {
		this.toolbar = [];
	}

	//hide all the buttons
	$('#toolbar .toolbarButton').addClass('hide');

	//show or create the required ones.
	for (var i in this.toolbar) {
		var button = this.toolbar[i];
		this.createToolbarButton(button);
	}

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
*	Creates the resources box.
*/
GUI.createResourcesBar = function () {
	for (var i in gameData.RESOURCES) {
		var resource = gameData.RESOURCES[i];
		this.createResourceElement(resource);
	}
}


/**
*	Adds a resource icon and the value to the resource box.
*/
GUI.createResourceElement = function (resource) {
	var div = '<div id="resource' + resource.id + '"><img src="' + gameSurface.IMG_PATH + resource.image + '"/><div>0</div></div>';
	$('#resources').append(div);
}


/**
*	Updates the resources box with the new values.
*/
GUI.updateResources = function () {
	var player = gameContent.players[gameContent.myArmy];
	for (var i in gameData.RESOURCES) {
		var resource = gameData.RESOURCES[i];
		$('div', '#resource' + resource.id).html(player.re[resource.id]);
	}
}


/**
*	Creates a toolbar button.
*/
GUI.createToolbarButton = function (button) {
	if ($('#toolbar' + button.buttonId).html() != null) {
		$('#toolbar' + button.buttonId).removeClass('hide');
	} else {
		var div = '<div id="toolbar' + button.buttonId + '" class="toolbarButton" title="' + button.name + '"><div><img src="' + gameSurface.IMG_PATH + button.image + '"/></div></div>';
		$('#toolbar').append(div);

		//add price
		for (var i in button.needs) {
			var need = button.needs[i];
			for (var j in gameData.RESOURCES) {
				if (gameData.RESOURCES[j].id == need.t) {
					var bottom = (this.toolbar.length - 1) * 72 - $('#toolbar' + button.buttonId).position().top + i * 20;
					$('#toolbar' + button.buttonId).append('<div class="price" style="bottom: ' + bottom + 'px"><img src="' + gameSurface.IMG_PATH + gameData.RESOURCES[j].image + '" />' + need.value + '</div>');
					break;
				}
			}
		}
	}
	if(!button.isEnabled) {
		$('#toolbar' + button.buttonId).addClass('disabled');
	} else {
		$('#toolbar' + button.buttonId).removeClass('disabled');
	}
}


/**
*	Updates the player's population box.
*/
GUI.updatePopulation = function () {
	var player = gameContent.players[gameContent.myArmy];
	$('div', '#population').html(player.pop.current + ' / ' + player.pop.max);
}


/**
*	One toolbar button has been selected.
*/
GUI.selectButton = function (button) {
	this.unselectButtons();
	$('#toolbar' + button.buttonId).addClass('selected');
}


/**
*	Unselect al the toolbar buttons.
*/
GUI.unselectButtons = function () {
	$('.toolbarButton').removeClass('selected');
}


/**
*	Initializes the info box.
*/
GUI.initInfobar = function () {
	$('#info').css('left', (window.innerWidth - $('#info').width()) / 2);
}


/**
*	Updates the information box.
*/
GUI.updateInfo = function () {
	if (gameContent.selected.length > 0) {
		var element = gameContent.gameElements[gameContent.selected[0]].s;
		var elementData = gameData.ELEMENTS[element.f][element.r][element.t];
		$('#name').html(elementData.name);
		$('#portrait').attr('src', gameSurface.IMG_PATH + elementData.image);
		$('#stats').html('');
		if (element.f == gameData.FAMILIES.terrain) {
			//terrain
			$('#life').html('&infin; / &infin;');
			for (var i in gameData.RESOURCES) {
				if (gameData.RESOURCES[i].id == elementData.resourceType) {
					this.addStatLine(gameData.RESOURCES[i].image, element.ra, "Amount of resources left");
					break;
				}
			}
		} else {
			$('#life').html(element.l + '/' + elementData.l);
			if (element.f == gameData.FAMILIES.building) {
				//building
				GUI.addStatLine("defense.png", elementData.defense, "Defense");
				GUI.addStatLine("population.png", elementData.pop, "Add to max population");
				for (var i in element.q) {
					var e = element.q[i];
					var inConstruction = gameData.ELEMENTS[gameData.FAMILIES.unit][element.r][e];
					if (i == 0) {
						GUI.addQueue(inConstruction.image, parseInt(element.qp) + '%', inConstruction.name);	
					} else {
						GUI.addQueue(inConstruction.image, '', inConstruction.name);	
					}
				}
			} else {
				//unit
				GUI.addStatLine("attack.png", elementData.attack, "Attack");
				GUI.addStatLine("defense.png", elementData.defense, "Defense");
				GUI.addStatLine("attackSpeed.png", elementData.attackSpeed, "Attack Speed");
				GUI.addStatLine("range.png", elementData.range, "Range");
			}
		}
		$('#info').removeClass('hide');
	} else if (!$('#info').hasClass('hide')){ 
		$('#info').addClass('hide');
	}
}


/**
*	Adds on stat line in the info box.
*/
GUI.addStatLine = function(image, text, tooltip) {
	$('#stats').append('<div class="stat" title="' + tooltip + '"><img src="' + gameSurface.IMG_PATH + image + '"/><div>' + text + '</div></div>');
}


/**
*	Adds on stat line in the info box.
*/
GUI.addQueue = function(image, text, tooltip) {
	$('#stats').append('<div class="queue" title="' + tooltip + '"><img src="' + gameSurface.IMG_PATH + image + '"/><div>' + text + '</div></div>');
}


/**
*	Initializes the minimap.
*/
GUI.initMinimap = function () {
	$('#minimap').click(function (e) {
		if (e.target.nodeName != 'IMG') {
			var dx = e.offsetX / 80;
			var dy = 1 - e.offsetY / 80;
			camera.position.x = dx * gameContent.map.size.x * gameSurface.PIXEL_BY_NODE;
			camera.position.y = dy * gameContent.map.size.y * gameSurface.PIXEL_BY_NODE;
		}
	});
}


/**
*	Updates minimap.
*/
GUI.updateMinimap = function () {
	$('#minimapLocation').css('left', (80 - 16) * camera.position.x / (gameContent.map.size.x * gameSurface.PIXEL_BY_NODE));
	$('#minimapLocation').css('top', (80 - 16) * (1 - camera.position.y / (gameContent.map.size.y * gameSurface.PIXEL_BY_NODE)));
}