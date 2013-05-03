var fightLogic = {};


/**
*	CONSTANTS
*/
fightLogic.WEAPON_TYPES = {
	normal : 0,
	piercing : 1,
	siege : 2,
	magic : 3
}

fightLogic.ARMOR_TYPES = {
	unarmored : 0,
	light : 1,
	medium : 2,
	heavy : 3,
	building : 4
}

fightLogic.WEAPONS_EFFICIENCY = [
	[1, 1, 1.5, 1, 0.3],
	[1.5, 1.5, 0.5, 0.5, 0.15],
	[1.5, 1, 0.5, 0.5, 2],
	[1.5, 1.5, 1.5, 1.5, 0.15]
]


/**
*	Applies a basic attack.
*/
fightLogic.attack = function (game, attacker, target) {
	var attackFactor = this.WEAPONS_EFFICIENCY[gameData.ELEMENTS[attacker.f][attacker.r][attacker.t].weaponType][gameData.ELEMENTS[target.f][target.r][target.t].armorType]; 
	var damage = Math.max(0, parseInt(gameData.ELEMENTS[attacker.f][attacker.r][attacker.t].attack * attackFactor * (1 + 0.2 * Math.random())) - gameData.ELEMENTS[target.f][target.r][target.t].defense);
	this.applyDamage(game, damage, target, attacker);
	tools.addUniqueElementToArray(game.modified, target);

	//target's survival instinct
	if (target.f == gameData.FAMILIES.unit && target.a == null && (target.mt == null || target.mt.x == null)) {
		AI.targetReaction(game, target, attacker);
	}

	//change player's rank
	game.players[target.o].ra[attacker.o] = gameData.RANKS.enemy;
}


/**
*	Applies damage of any attack to the target.
*	Increments frag if any attacker.
*/
fightLogic.applyDamage = function (game, damage, target, fragOwner) {
	target.l -= damage;
	//check if dead
	if(fragOwner != null && target.l <= 0) {
		fragOwner.fr = fragOwner.fr + 1;
		fragOwner.a = null;
		tools.addUniqueElementToArray(game.modified, fragOwner);
		target.murderer = fragOwner.o;

		//attack a new enemy
		AI.searchForNewEnemy(game, fragOwner);
	}
}

