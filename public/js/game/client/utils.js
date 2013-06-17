var utils = {};


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
*	Is there something under any part of this element ?
*/
utils.canBeBuiltHere = function (building) {
	var b1 = tools.getPartPosition(building, 0, 0);
	var b2 = {
		x : b1.x + building.shape[0].length - 1,
		y : b1.y + building.shape.length - 1
	};
	for (var n in gameContent.gameElements) {
		var element = gameContent.gameElements[n].s;
		var elementShape = gameData.ELEMENTS[element.f][element.r][element.t].shape;
		var e1 = tools.getPartPosition(element, 0, 0);
		var e2 = {
			x : e1.x + elementShape[0].length - 1,
			y : e1.y + elementShape.length - 1
		};
		//first filter
		if (b1.x <= 0 || b1.y <= 0 || b2.x >= gameContent.map.size.x - 1 || b2.y >= gameContent.map.size.y - 1 || e1.x >= b1.x && e1.x <= b2.x && (e1.y >= b1.y && e1.y <= b2.y || e2.y >= b1.y && e2.y <= b2.y)
			|| e2.x >= b1.x && e2.x <= b2.x && (e1.y >= b1.y && e1.y <= b2.y || e2.y >= b1.y && e2.y <= b2.y)) {
			building.canBeBuiltHere = false;
			for (var i = e1.x; i <= e2.x; i++) {
				for (var j = e1.y; j <= e2.y; j++) {
					if (i >= b1.x && i <= b2.x && j >= b1.y && j <= b2.y) {
						building.shape[i - b1.x][j - b1.y] = userInput.CANNOT_BE_BUILT_HERE;		
					}
				}
			}
		} 
	}
}


/**
*	Returns the game element from a chosen id.
*/
utils.getElementFromId = function (id) {
	return gameContent.gameElements[Object.keys(gameData.FAMILIES)[id.charAt(0)]][id];
}
