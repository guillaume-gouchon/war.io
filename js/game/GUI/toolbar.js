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


GUI.showBuildings = false;


/*
*	Updates the toolbar depending on the elements selected.
*/
GUI.updateToolbar = function () {
	if (gameLogic.selected.length > 0 && fightLogic.isAlly(gameLogic.selected[0])) {
		if (gameLogic.selected[0].family == gameData.FAMILIES.building) {
			//building(s) selected
			if (gameLogic.selected[0].constructionProgress < 100) {
				//building is not finished yet
				this.toolbar = [GUI.TOOLBAR_BUTTONS.cancel];
			} else {
				this.toolbar = buildLogic.getWhatCanBeBought(gameLogic.selected[0].owner, gameLogic.selected[0].buttons);
			}
		} else if (gameLogic.selected[0].family == gameData.FAMILIES.unit) {
			if(this.showBuildings) {
				this.toolbar = buildLogic.getBuildingButtons();
			} else {
				this.toolbar = gameLogic.selected[0].buttons;
			}
		}
	} else {
		this.toolbar = [];
	}
}
