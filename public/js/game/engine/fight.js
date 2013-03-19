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
	var attackFactor = this.weaponsEfficiency[gameData.ELEMENTS[attacker.family][attacker.race][attacker.type].weaponType][gameData.ELEMENTS[target.family][target.race][target.type].armorType]; 
	var damage = parseInt(gameData.ELEMENTS[attacker.family][attacker.race][attacker.type].attack * attackFactor * (1 + 0.2 * Math.random())) - gameData.ELEMENTS[target.family][target.race][target.type].defense;
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

