var rank = {};


/**
*	Checks if element is an enemy to me.
*/
rank.isEnemy = function (element) {
	if(gameLogic.players[gameLogic.myArmy].ranks[element.owner] == gameData.RANKS.ennemy) {
		return true;
	} else {
		return false;
	}
}


/**
*	Checks if element is my ally or not.
*/
rank.isAlly = function (element) {
	if(gameLogic.players[gameLogic.myArmy].ranks[element.owner] == gameData.RANKS.me
		|| gameLogic.players[gameLogic.myArmy].ranks[element.owner] == gameData.RANKS.ally) {
		return true;
	} else {
		return false;
	}
}