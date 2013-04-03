var fightLogic = {};


/**
*	CONSTANTS
*/
fightLogic.weaponsEfficiency = [
	[1, 1],
	[1, 1]
]





/**
*	Applies a basic attack.
*/
fightLogic.attack = function (attacker, target) {
	var attackFactor = this.weaponsEfficiency[gameData.ELEMENTS[attacker.f][attacker.r][attacker.t].weaponType][gameData.ELEMENTS[target.f][target.r][target.t].armorType]; 
	var damage = parseInt(gameData.ELEMENTS[attacker.f][attacker.r][attacker.t].attack * attackFactor * (1 + 0.2 * Math.random())) - gameData.ELEMENTS[target.f][target.r][target.t].defense;
	this.applyDamage(damage, target, attacker);
	gameLogic.addUniqueElementToArray(gameLogic.modified, target);
}


/**
*	Applies damage of any attack to the target.
*	Increments frag if any attacker.
*/
fightLogic.applyDamage = function (damage, target, fragOwner) {
	target.l = target.l - damage;
	//check if dead
	if(fragOwner != null && target.l <= 0) {
		fragOwner.frag = fragOwner.frag + 1;
		fragOwner.a = null;
	}

}

