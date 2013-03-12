var gameSurface = {};


/**
*	VARIABLES
*/
gameSurface.window = {
	width : 0,
	height : 0,
	x : 0,
	y : 0
}

gameSurface.scroll = {
	dx : 0,
	dy : 0
}


/**
*	Initializes the game surface
*/
gameSurface.init = function () {
	gameSurface.canvas = document.getElementById("canvas");
	gameSurface.canvas.height = document.height;
	gameSurface.canvas.width = document.width;
	gameSurface.ctx = gameSurface.canvas.getContext("2d");
	gameSurface.updateGameWindowSize();

	gameSurface.grd = gameSurface.ctx.createLinearGradient(0,0,200,0);
	gameSurface.grd.addColorStop(0,"white");
	gameSurface.grd.addColorStop(1,"green");
}


/**
*	Main drawing method
*/
gameSurface.draw = function () {
	this.ctx.fillStyle="#fff";
	this.ctx.fillRect(0, 0, gameSurface.canvas.width, gameSurface.canvas.height);

	for(var i in gameLogic.gameElements) {
		var element = gameLogic.gameElements[i];

		//check if element is in game window
		if(element.position.x >= this.window.x 
		  && element.position.x <= this.window.x + this.window.width
		  && element.position.y >= this.window.y 
		  && element.position.y <= this.window.y + this.window.height) {
			if(element.isSelected) {
				this.ctx.strokeStyle = '#00ff00';
				this.ctx.strokeRect(-1 + (element.position.x - this.window.x) * gameLogic.PIXEL_BY_NODE - gameLogic.PIXEL_BY_NODE * parseInt(element.shape[0].length / 2),
							  -1 + (element.position.y - this.window.y) * gameLogic.PIXEL_BY_NODE - gameLogic.PIXEL_BY_NODE * parseInt(element.shape.length / 2),
							  element.shape[0].length * gameLogic.PIXEL_BY_NODE + 2,
							  element.shape.length * gameLogic.PIXEL_BY_NODE + 2);
			}
			this.ctx.fillStyle = element.color;
			this.ctx.fillRect((element.position.x - this.window.x) * gameLogic.PIXEL_BY_NODE - gameLogic.PIXEL_BY_NODE * parseInt(element.shape[0].length / 2),
							  (element.position.y - this.window.y) * gameLogic.PIXEL_BY_NODE - gameLogic.PIXEL_BY_NODE * parseInt(element.shape.length / 2),
							  element.shape[0].length * gameLogic.PIXEL_BY_NODE,
							  element.shape.length * gameLogic.PIXEL_BY_NODE);

			if(element.family == gameData.FAMILIES.building) {
				if(element.queueProgression > 0) {
					this.ctx.fillStyle = this.grd;
					this.ctx.fillRect((element.position.x - this.window.x) * gameLogic.PIXEL_BY_NODE - gameLogic.PIXEL_BY_NODE * parseInt(element.shape[0].length / 2),
							   	 (element.position.y - this.window.y) * gameLogic.PIXEL_BY_NODE  - gameLogic.PIXEL_BY_NODE * parseInt(element.shape.length / 2),
							   	  element.queueProgression / 100 * gameLogic.PIXEL_BY_NODE * element.shape[0].length, 5);
				}
				if(element.constructionProgress < 100) {
					this.ctx.fillStyle = this.grd;
					this.ctx.fillRect((element.position.x - this.window.x) * gameLogic.PIXEL_BY_NODE - gameLogic.PIXEL_BY_NODE * parseInt(element.shape[0].length / 2),
							   	 (element.position.y - this.window.y) * gameLogic.PIXEL_BY_NODE  - gameLogic.PIXEL_BY_NODE * parseInt(element.shape.length / 2),
							   	  element.constructionProgress / 100 * gameLogic.PIXEL_BY_NODE * element.shape[0].length, 5);
				}
				for(var p in element.queue) {
					var stuff = element.queue[p];
					this.ctx.fillStyle = '#ff0';
					this.ctx.fillRect((element.position.x - this.window.x) * gameLogic.PIXEL_BY_NODE + p * gameLogic.PIXEL_BY_NODE - gameLogic.PIXEL_BY_NODE * parseInt(element.shape[0].length / 2), 
									   (element.position.y - this.window.y) * gameLogic.PIXEL_BY_NODE, 
									   gameLogic.PIXEL_BY_NODE, 
									   gameLogic.PIXEL_BY_NODE);
				}
			}

		}
	}

	//draw selection rectangle
	if(gameLogic.selectionRectangle.length == 4) {
		this.ctx.fillStyle="#0000ff";
		this.ctx.strokeRect(gameLogic.selectionRectangle[0], gameLogic.selectionRectangle[1], 
					   gameLogic.selectionRectangle[2], gameLogic.selectionRectangle[3]);
	}


	//draw building shadow
	if(gameLogic.building != null 
		&& gameLogic.building.position != null 
		&& gameLogic.building.position.x >= 0) {
		this.ctx.fillStyle = "#333";
		for(var i in gameLogic.building.shape) {
			for(var j in gameLogic.building.shape[i]) {
				var part = gameLogic.building.shape[i][j];
				if(part > 0) {
					if(part == buildLogic.STATUS_CAN_BUILD_HERE) {
						this.ctx.strokeStyle = '#00ff00';
					} else {
						this.ctx.strokeStyle = '#ff0000';
					}
					var position = tools.getPartPosition(gameLogic.building, i, j);
					this.ctx.strokeRect((position.x - this.window.x) * gameLogic.PIXEL_BY_NODE, 
										(position.y - this.window.y) * gameLogic.PIXEL_BY_NODE, 
										gameLogic.PIXEL_BY_NODE, 
										gameLogic.PIXEL_BY_NODE);	
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
	if(gameLogic.selected.length > 0 && fightLogic.isAlly(gameLogic.selected[0])) {
		this.ctx.strokeStyle="#ff00ff";
		if (gameLogic.selected[0].action != null) {
			this.ctx.strokeRect((gameLogic.selected[0].action.position.x - this.window.x) * gameLogic.PIXEL_BY_NODE,
								(gameLogic.selected[0].action.position.y - this.window.y) * gameLogic.PIXEL_BY_NODE, 
					   			 gameLogic.PIXEL_BY_NODE, 
					   			 gameLogic.PIXEL_BY_NODE);
		} else if (gameLogic.selected[0].moveTo != null 
				&& gameLogic.selected[0].moveTo.x != null) {
			this.ctx.strokeRect((gameLogic.selected[0].moveTo.x - this.window.x) * gameLogic.PIXEL_BY_NODE,
								(gameLogic.selected[0].moveTo.y - this.window.y) * gameLogic.PIXEL_BY_NODE, 
					   			 gameLogic.PIXEL_BY_NODE, 
					   			 gameLogic.PIXEL_BY_NODE);
		} else if (gameLogic.selected[0].family == gameData.FAMILIES.building
					&& gameLogic.selected[0].rallyingPoint != null) {
			this.ctx.strokeRect((gameLogic.selected[0].rallyingPoint.x - this.window.x) * gameLogic.PIXEL_BY_NODE,
				(gameLogic.selected[0].rallyingPoint.y - this.window.y) * gameLogic.PIXEL_BY_NODE, 
	   			 gameLogic.PIXEL_BY_NODE, 
	   			 gameLogic.PIXEL_BY_NODE);
		}
	}

}


/**
*	Map scrolling
*/
gameSurface.updateGameWindowSize = function () {
	gameSurface.window.height = parseInt(gameSurface.canvas.height / gameLogic.PIXEL_BY_NODE);
	gameSurface.window.width = parseInt(gameSurface.canvas.width / gameLogic.PIXEL_BY_NODE);
}
gameSurface.moveGameWindowPositionTo = function (x, y) {
	gameSurface.window.x = Math.max(0, Math.min(Math.max(0, gameLogic.grid[0].length - this.window.width), x));
	gameSurface.window.y = Math.max(0, Math.min(Math.max(0, gameLogic.grid.length - this.window.height)	, y));
}
gameSurface.moveGameWindowPositionBy = function (x, y) {
	gameSurface.moveGameWindowPositionTo(this.window.x + x, this.window.y + y);
}


/**
*	Returns the tile position according to the pixel position and the window position.
*/
gameSurface.getAbsolutePositionFromPixel = function (x, y) {
	return {
		x: parseInt(x / gameLogic.PIXEL_BY_NODE) + this.window.x, 
		y: parseInt(y / gameLogic.PIXEL_BY_NODE) + this.window.y
	};
}


/**
*	Updates the game window.
*	Called in the main thread.
*/
gameSurface.updateGameWindow = function () {
	this.moveGameWindowPositionBy(this.scroll.dx, this.scroll.dy);
}
