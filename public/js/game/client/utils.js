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


/**
*	Reads a cookie.
*/
utils.readCookie = function (name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}


/**
*	Creates a cookie.
*/
utils.createCookie = function (name, value) {
	document.cookie = name + "=" + value +"; path=/";
}


/**
*	Is this position free ?
*/
utils.getElementUnder = function (x, y) {
	for(var i in gameContent.gameElements) {
		var element = gameContent.gameElements[i];
	  	if(tools.isElementThere(element, {x : x, y : y})) {
	  		return true;
	  	}
	}
	return false;
}