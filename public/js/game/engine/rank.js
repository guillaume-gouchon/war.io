var rank = {};


/**
*	Checks if this element is an enemy to me.
*/
rank.isEnemy = function (players, me, element) {
	if(players[me].ra[element.o] == gameData.RANKS.enemy) {
		return true;
	} else {
		return false;
	}
}


/**
*	Checks if this element is an enemy to me.
*/
rank.canBeAttacked = function (players, me, element) {
	if(players[me].ra[element.o] == gameData.RANKS.enemy
		|| players[me].ra[element.o] == gameData.RANKS.neutral) {
		return true;
	} else {
		return false;
	}
}


/**
*	Checks if this element is my ally or not.
*/
rank.isAlly = function (players, me, element) {
	if(players[me].ra[element.o] == gameData.RANKS.me
		|| players[me].ra[element.o] == gameData.RANKS.ally) {
		return true;
	} else {
		return false;
	}
};