var rank = {};


/**
*	Checks if this element is an enemy to me.
*/
rank.isEnemy = function (me, element) {
	if(gameLogic.players[me].ra[element.o] == gameData.RANKS.enemy) {
		return true;
	} else {
		return false;
	}
}


/**
*	Checks if this element is my ally or not.
*/
rank.isAlly = function (me, element) {
	if(gameLogic.players[me].ra[element.o] == gameData.RANKS.me
		|| gameLogic.players[me].ra[element.o] == gameData.RANKS.ally) {
		return true;
	} else {
		return false;
	}
}