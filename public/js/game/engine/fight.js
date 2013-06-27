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
	[1, 1, 1.5, 1, 0.4],
	[1.5, 1.5, 0.5, 0.5, 0.2],
	[1.5, 1, 0.5, 0.5, 2],
	[1.5, 1.5, 1.5, 1.5, 0.1]
]


/**
*	Applies a basic attack.
*/
fightLogic.attack = function (game, attacker, target) {

	var attackerData = tools.getElementData(attacker);
	var defenderData = tools.getElementData(target);

	var attackFactor = this.WEAPONS_EFFICIENCY[attackerData.weaponType][defenderData.armorType]; 
	var damage = Math.max(0, parseInt(attackerData.attack * attackFactor * (1 + 0.2 * Math.random())) - defenderData.defense);

	this.applyDamage(game, damage, target, attacker);

	tools.addUniqueElementToArray(game.modified, target);

	// target's survival instinct
	if (target.f == gameData.FAMILIES.unit && target.a == null) {
		AI.targetReaction(game, target, attacker);
	}

	// change player's rank to enemy
	game.players[target.o].ra[attacker.o] = gameData.RANKS.enemy;

}


/**
*	Applies damage of any attack to the target.
*	Increments frag if any attacker.
*/
fightLogic.applyDamage = function (game, damage, target, fragOwner) {

	if (target.l > 0) {

		target.l -= damage;

		// check if target is dead
		if(target.l <= 0) {	

			target.fl = gameData.ELEMENTS_FLAGS.dying;

			if (fragOwner != null) {
				fragOwner.fr = fragOwner.fr + 1;
				fragOwner.a = null;
				tools.addUniqueElementToArray(game.modified, fragOwner);
				target.murderer = fragOwner.o;

				// attack a new enemy
				AI.searchForNewEnemy(game, fragOwner);
			}			

			// destroy building (not the units because of asynchronism)
			if (target.f == gameData.FAMILIES.building) {
				production.removeBuilding(game, target);
				gameCreation.removeGameElement(game, target);
				delete game.gameElements.building[target.id];
			}
		}

	} else if(fragOwner != null) {

		// attack a new enemy
		AI.searchForNewEnemy(game, fragOwner);
		
	}

}
