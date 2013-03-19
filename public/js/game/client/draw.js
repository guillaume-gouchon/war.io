var gameSurface = {};


/**
*	Initializes the game surface
*/
gameSurface.init = function () {
	gameSurface.canvas = document.getElementById("canvas");
	gameSurface.canvas.height = document.height;
	gameSurface.canvas.width = document.width;
	gameSurface.ctx = gameSurface.canvas.getContext("2d");

	gameSurface.grd = gameSurface.ctx.createLinearGradient(0,0,200,0);
	gameSurface.grd.addColorStop(0,"white");
	gameSurface.grd.addColorStop(1,"green");

	gameWindow.updateGameWindowSize();
}


/**
*	Main drawing method
*/
gameSurface.draw = function () {
	this.ctx.fillStyle="#fff";
	this.ctx.fillRect(0, 0, gameSurface.canvas.width, gameSurface.canvas.height);

	for(var i in gameContent.gameElements) {
		var element = gameContent.gameElements[i];

		//check if element is in game window
		if(element.position.x >= gameWindow.x 
		  && element.position.x <= gameWindow.x + gameWindow.width
		  && element.position.y >= gameWindow.y 
		  && element.position.y <= gameWindow.y + gameWindow.height) {
		  	var shape = gameData.ELEMENTS[element.family][element.race][element.type].shape;
			if(element.isSelected) {
				this.ctx.strokeStyle = '#00ff00';
				this.ctx.strokeRect(-1 + (element.position.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape[0].length / 2),
							  -1 + (element.position.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape.length / 2),
							  shape[0].length * gameWindow.PIXEL_BY_NODE + 2,
							  shape.length * gameWindow.PIXEL_BY_NODE + 2);
			}
			if(element.color != null) {
				this.ctx.fillStyle = element.color;
			} else {
				this.ctx.fillStyle = gameData.ELEMENTS[element.family][element.race][element.type].color;
			}
			this.ctx.fillRect((element.position.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape.length / 2),
							  (element.position.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape.length / 2),
							  shape[0].length * gameWindow.PIXEL_BY_NODE,
							  shape.length * gameWindow.PIXEL_BY_NODE);

			if(element.family == gameData.FAMILIES.building) {
				if(element.queueProgression > 0) {
					this.ctx.fillStyle = this.grd;
					this.ctx.fillRect((element.position.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape.length / 2),
							   	 (element.position.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE  - gameWindow.PIXEL_BY_NODE * parseInt(shape.length / 2),
							   	  element.queueProgression / 100 * gameWindow.PIXEL_BY_NODE * shape.length, 5);
				}
				if(element.constructionProgress < 100) {
					this.ctx.fillStyle = this.grd;
					this.ctx.fillRect((element.position.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape[0].length / 2),
							   	 (element.position.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE  - gameWindow.PIXEL_BY_NODE * parseInt(shape.length / 2),
							   	  element.constructionProgress / 100 * gameWindow.PIXEL_BY_NODE * shape[0].length, 5);
				}
				for(var p in element.queue) {
					var stuff = element.queue[p];
					this.ctx.fillStyle = '#ff0';
					this.ctx.fillRect((element.position.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE + p * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape[0].length / 2), 
									   (element.position.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE, 
									   gameWindow.PIXEL_BY_NODE, 
									   gameWindow.PIXEL_BY_NODE);
				}
			}

		}
	}

	//draw selection rectangle
	if(gameContent.selectionRectangle.length == 4) {
		this.ctx.fillStyle="#0000ff";
		this.ctx.strokeRect(gameContent.selectionRectangle[0], gameContent.selectionRectangle[1], 
					   gameContent.selectionRectangle[2], gameContent.selectionRectangle[3]);
	}


	//draw building shadow
	if(gameContent.building != null 
		&& gameContent.building.position != null 
		&& gameContent.building.position.x >= 0) {
		this.ctx.fillStyle = "#333";
		for(var i in gameContent.building.shape) {
			for(var j in gameContent.building.shape[i]) {
				var part = gameContent.building.shape[i][j];
				if(part > 0) {
					if(part == 10) {
						this.ctx.strokeStyle = '#00ff00';
					} else {
						this.ctx.strokeStyle = '#ff0000';
					}
					var position = tools.getPartPosition(gameContent.building, i, j);
					this.ctx.strokeRect((position.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE, 
										(position.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE, 
										gameWindow.PIXEL_BY_NODE, 
										gameWindow.PIXEL_BY_NODE);	
				}
			}
		}
	}


	//draw toolbar
	for(var i = 0; i < GUI.toolbar.length; i++) {
		var button = GUI.toolbar[i];
		if(button.isEnabled) {
			this.ctx.fillStyle = '#000';
		} else {
			this.ctx.fillStyle = '#f00';
		}
		this.ctx.fillRect(10 + i * 90, gameSurface.canvas.height - 80 , 80, 80);
	}

	//draw resources
	this.ctx.font="20px Arial";
	for(var i = 0; i < gameManager.players[gameManager.myArmy].resources.length; i++) {
		this.ctx.fillText(gameManager.players[gameManager.myArmy].resources[i], 20 + i * 100, 20);
	}

	//draw population
	this.ctx.fillText(gameManager.players[gameManager.myArmy].population.current + '/'
					+ gameManager.players[gameManager.myArmy].population.max, canvas.width - 60, 20);

	//draw order, rallying point
	if(gameContent.selected.length > 0 && rank.isAlly(gameContent.selected[0])) {
		this.ctx.strokeStyle="#ff00ff";
		if (gameContent.selected[0].action != null) {
			this.ctx.strokeRect((gameContent.selected[0].action.position.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE,
								(gameContent.selected[0].action.position.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE, 
					   			 gameWindow.PIXEL_BY_NODE, 
					   			 gameWindow.PIXEL_BY_NODE);
		} else if (gameContent.selected[0].moveTo != null 
				&& gameContent.selected[0].moveTo.x != null) {
			this.ctx.strokeRect((gameContent.selected[0].moveTo.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE,
								(gameContent.selected[0].moveTo.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE, 
					   			 gameWindow.PIXEL_BY_NODE, 
					   			 gameWindow.PIXEL_BY_NODE);
		} else if (gameContent.selected[0].family == gameData.FAMILIES.building
					&& gameContent.selected[0].rallyingPoint != null) {
			this.ctx.strokeRect((gameContent.selected[0].rallyingPoint.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE,
				(gameContent.selected[0].rallyingPoint.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE, 
	   			 gameWindow.PIXEL_BY_NODE, 
	   			 gameWindow.PIXEL_BY_NODE);
		}
	}

}

