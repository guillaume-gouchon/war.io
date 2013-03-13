var fightLogic = {};


/**
*	CONSTANTS
*/
fightLogic.weaponsEfficiency = [
	[1, 1],
	[1, 1]
]


/**
*	Checks if element is an enemy to me.
*/
fightLogic.isEnemy = function (element) {
	if(gameManager.players[gameManager.myArmy].ranks[element.owner] == gameData.RANKS.ennemy) {
		return true;
	} else {
		return false;
	}
}


/**
*	Checks if element is my ally or not.
*/
fightLogic.isAlly = function (element) {
	if(gameManager.players[gameManager.myArmy].ranks[element.owner] == gameData.RANKS.me
		|| gameManager.players[gameManager.myArmy].ranks[element.owner] == gameData.RANKS.ally) {
		return true;
	} else {
		return false;
	}
}


/**
*	Applies a basic attack.
*/
fightLogic.attack = function (attacker, target) {
	var attackFactor = this.weaponsEfficiency[attacker.weaponType][target.armorType]; 
	var damage = parseInt(attacker.attack * attackFactor * (1 + 0.2 * Math.random())) - target.defense;
	this.applyDamage(damage, target, attacker);
}


/**
*	Applies damage of any attack to the target.
*	Increments frag if any attacker.
*/
fightLogic.applyDamage = function (damage, target, fragOwner) {
	target.life = target.life - damage;

	//check if dead
	if(fragOwner != null && target.life <= 0) {
		fragOwner.frag = fragOwner.frag + 1;
		fragOwner.action = null;
	}

}


/**
*	Removes n-element from the gameElements array.
*/
fightLogic.removeElement = function (n) {
	gameLogic.gameElements.splice(n, 1);
}