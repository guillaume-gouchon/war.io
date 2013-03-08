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
	build : {color: '#aaaaaa'},
}


/*
*	Updates the toolbar depending on the elements selected.
*/
GUI.updateToolbar = function () {
	if(gameLogic.selected.length > 0 && fightLogic.isAlly(gameLogic.selected[0])) {
		if(gameLogic.selected[0].family == gameData.FAMILIES.building
			&& gameLogic.selected[0].constructionProgress < 100) {
			//building is not finished yet
			this.toolbar = [];
		} else {
			this.toolbar = gameLogic.selected[0].buttons;
		}
	} else {
		this.toolbar = [];
	}
}

