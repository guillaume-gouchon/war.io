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
		$('#topBar').append('<div id="resource' + resource.id + '">0</div>');
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
				gameContent.selected = [elementId];
				gameSurface.unselectAll();
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
	$('#population').html(player.pop.current + ' / ' + player.pop.max);
}
GUI.updateResources = function () {
	var player = gameContent.players[gameContent.myArmy];
	for (var i in gameData.RESOURCES) {
		var resource = gameData.RESOURCES[i]; 
		$('#resource' + resource.id).html(player.re[resource.id]);
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
				$('#listSelected').append('<button data-id="' + element.id + '" class="' + gameSurface.getLifeBarBackgroundColor(element.l / elementData.l) + '"><img alt="selected unit" src="'+  GUI.IMAGES_PATH + elementData.gui + '"</button>');
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
				$('#resourcesStatWood').html(element.ra);
				$('#resourcesStatWood').removeClass('hideI');
				$('#resourcesStatWater').addClass('hideI');
			} else {
				$('#resourcesStatWater').html(element.ra);
				$('#resourcesStatWood').addClass('hideI');
				$('#resourcesStatWater').removeClass('hideI');
			}
		} else {
			$('.landOnly').addClass('hideI');

			$('#lifeElement').html(element.l + '/' + elementData.l).attr('class', gameSurface.getLifeBarBackgroundColor(element.l / elementData.l) + ' stat');
			// $('#armorTypeStat').html(elementData.armorType).removeClass('hideI');
			$('#popStat').html(elementData.pop).removeClass('hideI');
			$('#defenseStat').html(accessors.getStat(gameContent.players, element.o, elementData, fightLogic.STATS_BUFF.defense)).removeClass('hideI');

			if (elementData.attack != null) {
				$('.unitOnly').removeClass('hideI');
				$('#fragsStat').html(element.fr);

				$('#attackStat').html(accessors.getStat(gameContent.players, element.o, elementData, fightLogic.STATS_BUFF.attack));
				$('#attackSpeedStat').html(accessors.getStat(gameContent.players, element.o, elementData, fightLogic.STATS_BUFF.attackSpeed));
				$('#rangeStat').html(accessors.getStat(gameContent.players, element.o, elementData, fightLogic.STATS_BUFF.range));
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
					$('img:eq(' + i + ')', '#queueBuilding').attr('src', GUI.IMAGES_PATH + q.gui);
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
				tooltip += '<p class="price"><img alt="requirement" src="' + GUI.IMAGES_PATH + gameData.RESOURCES[Object.keys(gameData.RESOURCES)[need.t]].image + '"/>' + need.value + '</p>';
			} else {
				tooltip += '<p>' + need.t + '</p>';
			}
		}

		var div = '<button id="toolbar' + button.id + '" data-id="' + button.id + '" class="enableTooltip" data-toggle="tooltip" title=\'' + tooltip + '\'><img alt="' + button.name + '" src="' + GUI.IMAGES_PATH + button.gui + '"/></button>';
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








// /**
// *	Initializes the diplomacy section.
// */
// GUI.initDiplomacy = function () {
// 	for (var i in gameContent.players) {
// 		if (i != gameContent.myArmy) {
// 			var player = gameContent.players[i];
// 			$('#diplomacy').append('<div id="diplomacy' + i + '">'
// 				+ '<div class="smallButton ' + gameSurface.PLAYERS_COLORS[i] + '">' + player.n + '</div>'
// 				+ '<div class="smallButton customRadio white" data-name="diplomacy' + i + '" data-value="' + gameData.RANKS.neutral + '">Neutral</div>'
// 				+ '<div class="smallButton customRadio white" data-name="diplomacy' + i + '" data-value="' + gameData.RANKS.enemy + '">Enemy</div>'
// 				+ '</div>');
// 			this.updateDiplomacyButtons(player);
// 		}
// 	}

// 	//add event
// 	$('.customRadio', '#diplomacy').click(function () {
// 		soundManager.playSound(soundManager.SOUNDS_LIST.button);
// 		$('.customRadio[data-name="' + $(this).attr('data-name') + '"]').removeClass('checked');
// 		$(this).addClass('checked');
// 		gameManager.sendOrderToEngine(order.TYPES.diplomacy, [gameContent.myArmy, $(this).attr('data-name').replace('diplomacy', ''), $(this).attr('data-value')]);
// 	});
// }


// /**
// *	Updates the diplomacy buttons for one player.
// */
// GUI.updateDiplomacyButtons = function (player) {
// 	$('.customRadio', '#diplomacy' + player.o).removeClass('checked');
// 	if (gameContent.players[gameContent.myArmy].ra[player.o] == gameData.RANKS.neutral) {
// 		$('.customRadio', '#diplomacy' + player.o).first().addClass('checked');
// 	} else {
// 		$('.customRadio', '#diplomacy' + player.o).last().addClass('checked');
// 	}
// }