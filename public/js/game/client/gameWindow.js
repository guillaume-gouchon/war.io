var gameWindow = {};


/**
*	CONSTANTS
*/
gameWindow.MAP_SCROLL_SPEED = 5;
gameWindow.SCROLL_THRESHOLD = 30;


/**
* Initializes the game window.
*/
gameWindow.width = 0;
gameWindow.height = 0;
gameWindow.x = 0;
gameWindow.y = 0;


/**
*	Manages the current zoom of the game window.
*/
gameWindow.PIXEL_BY_NODE = 15;
gameWindow.zoom = 15;
gameWindow.ZOOM_MAX = 30;
gameWindow.ZOOM_MIN = 10;


/**
*	Handles the window scrolling.
*/
gameWindow.scroll = {
	dx : 0,
	dy : 0
}
gameWindow.updateGameWindowSize = function () {
	this.height = parseInt(gameSurface.canvas.height / this.PIXEL_BY_NODE);
	this.width = parseInt(gameSurface.canvas.width / this.PIXEL_BY_NODE);
}
gameWindow.moveGameWindowPositionTo = function (x, y) {
	this.x = Math.max(0, Math.min(Math.max(0, gameManager.map.size.x - this.width), x));
	this.y = Math.max(0, Math.min(Math.max(0, gameManager.map.size.y - this.height), y));
}
gameWindow.moveGameWindowPositionBy = function (x, y) {
	this.moveGameWindowPositionTo(this.x + x, this.y + y);
}

/**
*	Map navigation
*/
gameWindow.updateHorizontalScrolling = function (x) {
	this.scroll.dx = x * this.MAP_SCROLL_SPEED;
}
gameWindow.updateVerticalScrolling = function (y) {
	this.scroll.dy = - y * this.MAP_SCROLL_SPEED;
}
gameWindow.stopMapScrolling = function () {
	this.updateHorizontalScrolling(0);
	this.updateVerticalScrolling(0);
}


/**
*	Updates the game window position.
*	Called in the main thread.
*/
gameWindow.update = function () {
	this.PIXEL_BY_NODE = this.zoom;
	this.moveGameWindowPositionBy(this.scroll.dx, this.scroll.dy);
}


/**
*	Returns the tile position according to the pixel position and the window position.
*/
gameWindow.getAbsolutePositionFromPixel = function (x, y) {
	return {
		x: parseInt(x / this.PIXEL_BY_NODE) + this.x, 
		y: parseInt(y / this.PIXEL_BY_NODE) + this.y
	};
}

