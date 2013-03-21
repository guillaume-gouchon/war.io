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
		if(element.p.x >= gameWindow.x 
		  && element.p.x <= gameWindow.x + gameWindow.width
		  && element.p.y >= gameWindow.y 
		  && element.p.y <= gameWindow.y + gameWindow.height) {
		  	var shape = gameData.ELEMENTS[element.f][element.r][element.t].shape;
			if(element.isSelected) {
				this.ctx.strokeStyle = '#00ff00';
				this.ctx.strokeRect(-1 + (element.p.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape[0].length / 2),
							  -1 + (element.p.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape.length / 2),
							  shape[0].length * gameWindow.PIXEL_BY_NODE + 2,
							  shape.length * gameWindow.PIXEL_BY_NODE + 2);
			}
			if(element.c != null) {
				this.ctx.fillStyle = element.c;
			} else {
				this.ctx.fillStyle = gameData.ELEMENTS[element.f][element.r][element.t].c;
			}
			this.ctx.fillRect((element.p.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape.length / 2),
							  (element.p.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape.length / 2),
							  shape[0].length * gameWindow.PIXEL_BY_NODE,
							  shape.length * gameWindow.PIXEL_BY_NODE);

			if(element.f == gameData.FAMILIES.building) {
				if(element.qp > 0) {
					this.ctx.fillStyle = this.grd;
					this.ctx.fillRect((element.p.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape.length / 2),
							   	 (element.p.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE  - gameWindow.PIXEL_BY_NODE * parseInt(shape.length / 2),
							   	  element.qp / 100 * gameWindow.PIXEL_BY_NODE * shape.length, 5);
				}
				if(element.cp < 100) {
					this.ctx.fillStyle = this.grd;
					this.ctx.fillRect((element.p.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape[0].length / 2),
							   	 (element.p.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE  - gameWindow.PIXEL_BY_NODE * parseInt(shape.length / 2),
							   	  element.cp / 100 * gameWindow.PIXEL_BY_NODE * shape[0].length, 5);
				}
				for(var p in element.q) {
					var stuff = element.q[p];
					this.ctx.fillStyle = '#ff0';
					this.ctx.fillRect((element.p.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE + p * gameWindow.PIXEL_BY_NODE - gameWindow.PIXEL_BY_NODE * parseInt(shape[0].length / 2), 
									   (element.p.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE, 
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
		&& gameContent.building.p != null 
		&& gameContent.building.p.x >= 0) {
		this.ctx.fillStyle = "#333";
		for(var i in gameContent.building.shape) {
			for(var j in gameContent.building.shape[i]) {
				var part = gameContent.building.shape[i][j];
				if(part > 0) {
					if(part == userInput.CAN_BE_BUILT_HERE) {
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
	for(var i = 0; i < gameLogic.players[gameManager.myArmy].re.length; i++) {
		this.ctx.fillText(gameLogic.players[gameManager.myArmy].re[i], 20 + i * 100, 20);
	}

	//draw population
	this.ctx.fillText(gameLogic.players[gameManager.myArmy].pop.current + '/'
					+ gameLogic.players[gameManager.myArmy].pop.max, canvas.width - 60, 20);

	//draw order, rallying point
	if(gameContent.selected.length > 0 && rank.isAlly(gameManager.myArmy, gameContent.selected[0])) {
		this.ctx.strokeStyle="#ff00ff";
		if (gameContent.selected[0].a != null) {
			this.ctx.strokeRect((gameContent.selected[0].a.p.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE,
								(gameContent.selected[0].a.p.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE, 
					   			 gameWindow.PIXEL_BY_NODE, 
					   			 gameWindow.PIXEL_BY_NODE);
		} else if (gameContent.selected[0].mt != null 
				&& gameContent.selected[0].mt.x != null) {
			this.ctx.strokeRect((gameContent.selected[0].mt.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE,
								(gameContent.selected[0].mt.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE, 
					   			 gameWindow.PIXEL_BY_NODE, 
					   			 gameWindow.PIXEL_BY_NODE);
		} else if (gameContent.selected[0].f == gameData.FAMILIES.building
					&& gameContent.selected[0].rp != null) {
			this.ctx.strokeRect((gameContent.selected[0].rp.x - gameWindow.x) * gameWindow.PIXEL_BY_NODE,
				(gameContent.selected[0].rp.y - gameWindow.y) * gameWindow.PIXEL_BY_NODE, 
	   			 gameWindow.PIXEL_BY_NODE, 
	   			 gameWindow.PIXEL_BY_NODE);
		}
	}

}

