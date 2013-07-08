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
GUI.BUTTONS_SIZE = 80;
GUI.TOOLBAR_BUTTONS = {
	build : {buttonId : 1000, image : 'build.png', isEnabled : true, name: 'Build'},
	cancel : {buttonId : 1001, image : 'cancel.png', isEnabled : true, name: 'Cancel'}
}
GUI.MOUSE_ICONS = {
	standard : 'url("' + GUI.IMAGES_PATH + 'cursor.png"), auto', 
	select : 'url("' + GUI.IMAGES_PATH + 'cursor_hover.png"), auto',
	attack : 'url("' + GUI.IMAGES_PATH + 'cursor_attack.png"), auto',
	arrowTop : 'n-resize',
	arrowTopRight : 'ne-resize',
	arrowTopLeft : 'nw-resize',
	arrowBottom : 's-resize',
	arrowBottomRight : 'se-resize',
	arrowBottomLeft : 'sw-resize',
	arrowRight : 'e-resize',
	arrowLeft : 'w-resize'
}
GUI.UPDATE_FREQUENCY = 0.5;


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
	this.initDiplomacy();
	$('.enableTooltip').tooltip();
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
	if (gameContent.selected.length > 0 && rank.isAlly(gameContent.players, gameContent.myArmy, utils.getElementFromId(gameContent.selected[0]))) {
		var selected = utils.getElementFromId(gameContent.selected[0]);
		if (selected.f == gameData.FAMILIES.building) {
			// building(s) are selected
			if (selected.cp < 100) {
				// building is not finished yet, show cancel button
				this.toolbar = [GUI.TOOLBAR_BUTTONS.cancel];
			} else {
				this.toolbar = production.getWhatCanBeBought(gameContent.players, selected.o, tools.getElementDataFrom(gameData.FAMILIES.building, selected.r, selected.t).buttons);
			}
		} else if (selected.f == gameData.FAMILIES.unit) {
			// unit(s) are selected
			if(this.showBuildings) {
				this.toolbar = this.getBuildingButtons(selected);
			} else {
				this.toolbar = tools.getElementDataFrom(gameData.FAMILIES.unit, selected.r, selected.t).buttons;
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
		$('#topBar').append('<div id="resource' + resource.id + '" class="spriteBefore">0</div>');
	}
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
		var div = '<button id="toolbar' + button.buttonId + '" class="toolbarButton enableTooltip" data-toggle="tooltip" title="' + button.name + '"><img alt="' + button.name + '" src="' + GUI.IMAGES_PATH + button.image + '"/></div>';
		$('#toolbar').append(div);

		//add price
		for (var i in button.needs) {
			var need = button.needs[i];
			for (var j in gameData.RESOURCES) {
				if (gameData.RESOURCES[j].id == need.t) {
					var bottom = (this.toolbar.length - 1) * GUI.BUTTONS_SIZE - $('#toolbar' + button.buttonId).position().top + i * 20 + 10;
					$('#toolbar' + button.buttonId).append('<div class="price" style="bottom: ' + bottom + 'px"><div class="spriteBefore sprite-' + gameData.RESOURCES[j].image.replace('.png', '') + '15" />' + need.value + '</div></div>');
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
	$('#population').html(player.pop.current + ' / ' + player.pop.max);
}


/**
*	One toolbar button has been selected.
*/
GUI.selectButton = function (button) {
	this.unselectButtons();
	$('#toolbar' + button.buttonId).addClass('sprite-boxSelect');
}


/**
*	Unselect al the toolbar buttons.
*/
GUI.unselectButtons = function () {
	$('.toolbarButton').removeClass('sprite-boxSelect');
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
		var element = utils.getElementFromId(gameContent.selected[0]);
		var elementData = tools.getElementData(element);
		$('#name').html(elementData.name);
		$('#portrait').attr('class', 'sprite sprite-' + elementData.image.replace('.png', ''));
		if (elementData.attack != null) {
			$('#frags').html('FRAGS : ' + element.fr);
		} else {
			$('#frags').html('');
		}
		$('#stats').html('');
		if (element.f == gameData.FAMILIES.land) {
			//land
			$('#life').html('&infin; / &infin;');
			for (var i in gameData.RESOURCES) {
				if (gameData.RESOURCES[i].id == elementData.resourceType) {
					this.addStatLine(gameData.RESOURCES[i].image.replace('.png', '') + '15', element.ra, "Amount of resources left");
					break;
				}
			}
		} else {
			$('#life').html(element.l + '/' + elementData.l);
			if (element.f == gameData.FAMILIES.building && elementData.attack == null) {
				//building
				GUI.addStatLine("defense", elementData.defense, "Defense");
				GUI.addStatLine("pop20", elementData.pop, "Max Population Bonus");

				for (var i in element.q) {
					var e = element.q[i];
					var inConstruction = tools.getElementDataFrom(gameData.FAMILIES.unit, element.r, e);
					if (i == 0) {
						GUI.addQueue(inConstruction.image, parseInt(element.qp) + '%', inConstruction.name);	
					} else {
						GUI.addQueue(inConstruction.image, '', inConstruction.name);	
					}
				}
			} else {
				//unit
				GUI.addStatLine("attack", elementData.attack, "Attack");
				GUI.addStatLine("defense", elementData.defense, "Defense");
				GUI.addStatLine("attackSpeed", elementData.attackSpeed, "Attack Speed");
				GUI.addStatLine("range", elementData.range, "Range");
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
	$('#stats').append('<div class="stat" title="' + tooltip + '"><div class="spriteBefore sprite-' + image + '">' + text + '</div></div>');
}


/**
*	Adds on stat line in the info box.
*/
GUI.addQueue = function(image, text, tooltip) {
	$('#stats').append('<div class="queue" title="' + tooltip + '"><div id="queueProgress">' + text + '</div><div class="sprite sprite-' + image.replace('.png', '') + '15"></div></div>');
}


/**
*	Initializes the minimap.
*/
GUI.initMinimap = function () {
	$('#minimap').mousedown(function (e) {
		var x = (GUI.MINIMAP_SIZE - window.innerWidth + e.clientX) / GUI.MINIMAP_SIZE * gameContent.map.size.x * gameSurface.PIXEL_BY_NODE;
		var y = (window.innerHeight - e.clientY) / GUI.MINIMAP_SIZE * gameContent.map.size.y * gameSurface.PIXEL_BY_NODE;
		if (e.which == 1) {
		} else if (e.which == 3 && gameContent.selected.length > 0
			&& rank.isAlly(gameContent.players, gameContent.myArmy, utils.getElementFromId(gameContent.selected[0]))
			&& utils.getElementFromId(gameContent.selected[0]).f == gameData.FAMILIES.unit
		|| utils.getElementFromId(gameContent.selected[0]).f == gameData.FAMILIES.building) {
			x = parseInt(x / gameSurface.PIXEL_BY_NODE);
			y = parseInt(y / gameSurface.PIXEL_BY_NODE);
//			userInput.sendOrder(x, y);
		}
	});
}


/**
*	Updates minimap.
*/
GUI.updateMinimap = function () {
	$('#minimapLocation').css('left', -8 + (this.MINIMAP_SIZE) * camera.position.x / (gameContent.map.size.x * gameSurface.PIXEL_BY_NODE));
	$('#minimapLocation').css('top', -8 + (this.MINIMAP_SIZE) * (1 - camera.position.z / (gameContent.map.size.y * gameSurface.PIXEL_BY_NODE)));
}


/**
*	Adds an element on the minimap.
*/
GUI.addElementOnMinimap = function (element) {
	var className;
	if (element.f == gameData.FAMILIES.building) {
		className = 'minimapPointBuilding';
	} else {
		className = 'minimapPointUnit';
	}
	$('#minimap').append('<span id="minimap' + element.id + '" class="' + className + ' ' + gameSurface.PLAYERS_COLORS[element.o] + '">&nbsp;</span>');
	$('#minimap' + element.id).css('left', (this.MINIMAP_SIZE) * element.p.x / gameContent.map.size.x);
	$('#minimap' + element.id).css('top', (this.MINIMAP_SIZE) * (1 - element.p.y / gameContent.map.size.y));
}


/**
*	Adds an alert on the minimap.
*/
GUI.addAlertMinimap = function (element) {
	$('#minimap' + element.id).html('!');
}


/**
*	Updates an element on the minimap.
*/
GUI.updateElementOnMinimap = function (element) {
	$('#minimap' + element.id).html('&nbsp;').css('left', (this.MINIMAP_SIZE) * element.p.x / gameContent.map.size.x);
	$('#minimap' + element.id).css('top', (this.MINIMAP_SIZE) * (1 - element.p.y / gameContent.map.size.y));
}


/**
*	Removes an element from the minimap.
*/
GUI.removeElementFromMinimap = function (element) {
	$('#minimap' + element.id).remove();
}


/**
*	Initializes the diplomacy section.
*/
GUI.initDiplomacy = function () {
	for (var i in gameContent.players) {
		if (i != gameContent.myArmy) {
			var player = gameContent.players[i];
			$('#diplomacy').append('<div id="diplomacy' + i + '">'
				+ '<div class="smallButton ' + gameSurface.PLAYERS_COLORS[i] + '">' + player.n + '</div>'
				+ '<div class="smallButton customRadio white" data-name="diplomacy' + i + '" data-value="' + gameData.RANKS.neutral + '">Neutral</div>'
				+ '<div class="smallButton customRadio white" data-name="diplomacy' + i + '" data-value="' + gameData.RANKS.enemy + '">Enemy</div>'
				+ '</div>');
			this.updateDiplomacyButtons(player);
		}
	}

	//add event
	$('.customRadio', '#diplomacy').click(function () {
		soundManager.playSound(soundManager.SOUNDS_LIST.button);
		$('.customRadio[data-name="' + $(this).attr('data-name') + '"]').removeClass('checked');
		$(this).addClass('checked');
		gameManager.sendOrderToEngine(order.TYPES.diplomacy, [gameContent.myArmy, $(this).attr('data-name').replace('diplomacy', ''), $(this).attr('data-value')]);
	});
}


/**
*	Updates the diplomacy buttons for one player.
*/
GUI.updateDiplomacyButtons = function (player) {
	$('.customRadio', '#diplomacy' + player.o).removeClass('checked');
	if (gameContent.players[gameContent.myArmy].ra[player.o] == gameData.RANKS.neutral) {
		$('.customRadio', '#diplomacy' + player.o).first().addClass('checked');
	} else {
		$('.customRadio', '#diplomacy' + player.o).last().addClass('checked');
	}
}