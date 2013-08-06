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

fightLogic.STATS_BUFF = {
	attack: 0,
	defense: 1,
	attackSpeed: 2,
	speed: 3,
	range: 4,
	vision: 5
}

fightLogic.ACTIVE_BUFF = {
	poison: 0
}

fightLogic.PASSIVE_SKILLS = {
	poison: 'poison',// value = {damage: ?, time: ?}
	zone: 'zone',// value = radius
	suicide: 'suicide',// value = percentage of life spent to attack (100 = one shot)
	shootDelay: 'shootDelay'// value = {current: 0, delay: ?}
}

fightLogic.LANDS_MODIFIERS = {
	highgrass: 0.5
}


/**
*	Applies a basic attack.
*/
fightLogic.attack = function (game, attacker, target) {

	var attackerData = tools.getElementData(attacker);
	var defenderData = tools.getElementData(target);

	var attackFactor = this.WEAPONS_EFFICIENCY[attackerData.weaponType][defenderData.armorType]; 
	var damage = Math.max(0, parseInt(accessors.getStat(game.players, attacker.o, attackerData, this.STATS_BUFF.attack) * attackFactor * (1 + 0.2 * Math.random())) - accessors.getStat(game.players, target.o, defenderData, this.STATS_BUFF.defense));

	// lands modifiers
	if (game.grid[target.p.x][target.p.y].s != null) {
		damage *= fightLogic.LANDS_MODIFIERS[game.grid[target.p.x][target.p.y].s];
	}

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
