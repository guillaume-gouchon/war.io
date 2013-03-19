var GUI = {};


/**
*	Current toolbar.
*	It contains the buttons to be shown to the user.
*/
GUI.toolbar = [];


/**
*	CONSTANTS
*/
GUI.TOOLBAR_HEIGHT = 80;
GUI.BUTTONS_WIDTH = 80;
GUI.BUTTONS_SPACE = 10;
GUI.TOOLBAR_BUTTONS = {
	build : {color : '#aaa', isEnabled : true},
	cancel : {color : '#ff0', isEnabled : true},
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


GUI.showBuildings = false;


/**
*	Updates the GUI.
*	Called in the main thread.
*/
GUI.update = function () {
	this.updateToolbar();
}


/**
*	Updates the toolbar depending on the elements selected.
*/
GUI.updateToolbar = function () {
	if (gameContent.selected.length > 0 && rank.isAlly(gameContent.selected[0])) {
		if (gameContent.selected[0].family == gameData.FAMILIES.building) {
			//building(s) selected
			if (gameContent.selected[0].constructionProgress < 100) {
				//building is not finished yet
				this.toolbar = [GUI.TOOLBAR_BUTTONS.cancel];
			} else {
				this.toolbar = production.getWhatCanBeBought(gameContent.selected[0].owner, gameContent.selected[0].buttons);
			}
		} else if (gameContent.selected[0].family == gameData.FAMILIES.unit) {
			if(this.showBuildings) {
				this.toolbar = this.getBuildingButtons();
			} else {
				this.toolbar = gameContent.selected[0].buttons;
			}
		}
	} else {
		this.toolbar = [];
	}
}


/**
*	Returns the list of the buildings which can be built by the builder(s) selected.
*/
GUI.getBuildingButtons = function () {
	return production.getWhatCanBeBought(gameContent.selected[0].owner, gameData.BUILDINGS[gameContent.selected[0].race]);
}


/**
*	Updates the mouse icon displayed.
*/
GUI.updateMouse = function (mouseIcon) {
	document.body.style.cursor = mouseIcon;
}