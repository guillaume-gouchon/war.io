var utils = {};


/**
*	Returns the tile position according to the pixel position and the window position.
*/
utils.getAbsolutePositionFromPixel = function (x, y) {
	return {
		x: parseInt(x / gameWindow.PIXEL_BY_NODE) + gameWindow.x, 
		y: parseInt(y / gameWindow.PIXEL_BY_NODE) + gameWindow.y
	};
}