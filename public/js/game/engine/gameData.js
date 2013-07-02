var gameData = {}


/**
*	Ids to categorize the different game elements.
*/
gameData.FAMILIES = {
	unit : 0,
	building : 1,
	land : 2
}


/**
*	Big array containing all the elements data.
*/
gameData.ELEMENTS = [[], [] ,[]];
gameData.BASECAMPS = [];


/**
*	List of player's ranks.
*/
gameData.RANKS = {
	me : 0,
	ally : 1,
	neutral : 2,
	enemy : 3
}


/**
*	List of player's statuses.
*/
gameData.PLAYER_STATUSES = {
	ig : 0,
	defeat : 1,
	victory : 2,
	watcher : 3,
	surrender : 4
}


/**
*	Used for elements animations.
*/
gameData.ELEMENTS_FLAGS = {
	nothing : 0,
	moving: 1,
	attacking : 2,
	mining : 3,
	//damaged : 4,
	dying : 5,
	building : 6
}


/**
* 	Global variable to get a unique id for any game element.
*/
gameData.unitId = 0;


/**
*	Creates a unique id for every game element.
*/
gameData.createUniqueId = function (family) {
	this.unitId += 1;
	return parseInt('1' + family + '' + this.unitId);
}
