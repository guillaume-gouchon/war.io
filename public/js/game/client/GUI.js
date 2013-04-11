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
	build : {id : 0, image : 'build.png', isEnabled : true, name: 'build'},
	cancel : {id : 1, image : 'cancel.png', isEnabled : true, name: 'cancel'}
}
GUI.MOUSE_ICONS = {
	standard : 'default', 
	arrowTop : 'n-resize',
	arrowTopRight : 'ne-resize',
	arrowTopLeft : 'nw-resize',
	arrowBottom : 's-resize',
	arrowBottomRight : 'se-resize',
	arrowBottomLeft : 'sw-resize',
	arrowRight : 'e-resize',
	arrowLeft : 'w-resize',
	select : 'crosshair'
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
}


/**
*	Updates the GUI.
*	Called in the main thread.
*/
GUI.update = function () {
	this.updatePopulation();
	this.updateResources();
	this.updateToolbar();
}


/**
*	Updates the toolbar depending on the elements selected.
*/
GUI.updateToolbar = function () {
	if (gameContent.selected.length > 0 && rank.isAlly(gameContent.myArmy, gameContent.gameElements[gameContent.selected[0]].s)) {
		var selected = gameContent.gameElements[gameContent.selected[0]].s;
		if (selected.f == gameData.FAMILIES.building) {
			//building(s) are selected
			if (selected.cp < 100) {
				//building is not finished yet, show cancel button
				this.toolbar = [GUI.TOOLBAR_BUTTONS.cancel];
			} else {
				this.toolbar = production.getWhatCanBeBought(selected.o, gameData.ELEMENTS[gameData.FAMILIES.building][selected.r][selected.t].buttons);
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
	$('#toolbar div').addClass('hide');

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
	return production.getWhatCanBeBought(builder.o, gameData.ELEMENTS[gameData.FAMILIES.building][builder.r]);
}


/**
*	Updates the mouse icon displayed.
*/
GUI.updateMouse = function (mouseIcon) {
	document.body.style.cursor = mouseIcon;
}


/**
*	Creates the resources bar.
*/
GUI.createResourcesBar = function () {
	for (var i in gameData.RESOURCES) {
		var resource = gameData.RESOURCES[i];
		this.createResourceElement(resource);
	}
}


/**
*	Adds a resource icon + value to the resource bar.
*/
GUI.createResourceElement = function (resource) {
	var div = '<div id="resource' + resource.id + '"><img src="' + gameSurface.IMG_PATH + resource.image + '"/><div>0</div></div>';
	$('#resources').append(div);
}


/**
*	Updates the resources bar with the new values.
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
	if ($('#toolbar' + button.name).html() != null) {
		$('#toolbar' + button.name).removeClass('hide');
	} else {
		var div = '<div id="toolbar' + button.name + '" class="toolbarButton"><img src="' + gameSurface.IMG_PATH + button.image + '"/></div>';
		$('#toolbar').append(div);
	}
	if(!button.isEnabled) {
		$('#toolbar' + button.name).addClass('disabled');
	} else {
		$('#toolbar' + button.name).removeClass('disabled');
	}
}


/**
*	Updates the player's population bar.
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
	$('img', '#toolbar' + button.name).addClass('selected');
}


/**
*	Unselect al the toolbar buttons.
*/
GUI.unselectButtons = function () {
	$('img', '.toolbarButton').removeClass('selected');
}

