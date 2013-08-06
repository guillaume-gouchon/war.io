var action = {};


/**
*	CONSTANTS
*/

action.ACTION_TYPES = {
	move : 0,
	attack : 1,
	gather : 2,
	patrol : 3,
	build : 4,
	hold : 5
}
action.BUILD_ACTION_SPEED = 3;
action.ATTACK_SPEED_CONSTANT = 5;


/**
*	Basic build action.
*/
action.doTheBuild = function (game, element, building) {

		if (building.cp < 100) {// building still in construction

			if (game.iterate % this.BUILD_ACTION_SPEED == 0) {

				production.updateConstruction(game, building);
				element.fl = gameData.ELEMENTS_FLAGS.building;

			}

		} else if (building.l < tools.getElementData(building).l) {// building damaged = repair it

			if (game.iterate % this.BUILD_ACTION_SPEED == 0) {
			
				production.repairBuilding(game, building);
				element.fl = gameData.ELEMENTS_FLAGS.building;
			
			}

		} else {

			// building construction / repairing is over
			order.goToElementNextOrder(game, element);

		}

}


/**
*	Basic attack action.
*/
action.doTheAttack = function (game, element, target) {
	var elementData = tools.getElementData(element);
	if(game.iterate % (this.ATTACK_SPEED_CONSTANT - accessors.getStat(game.players, element.o, elementData, fightLogic.STATS_BUFF.attackSpeed)) == 0) {

		// shooting delay after moving (time to set up the weapon)
		var shootingDelay = elementData.passiveSkill[fightLogic.PASSIVE_SKILLS.shootDelay]; 
		if (shootingDelay != null) {
			if (shootingDelay.current > 0) {
				shootingDelay.current--;
				return;
			}
		}

		fightLogic.attack(game, element, target);
		element.fl = gameData.ELEMENTS_FLAGS.attacking;

		// damage zone attack
		var zoneAttack = elementData.passiveSkill[fightLogic.PASSIVE_SKILLS.zone]; 
		if (zoneAttack != null) {
			var targetTiles = tools.getTilesAround(game.grid, target.p, zoneAttack, true);
			for (var i in targetTiles) {
				if (targetTiles[i].c != null) {
					var zoneTarget = tools.getElementById(game, targetTiles[i].c);
					if (zoneTarget.f != gameData.FAMILIES.land) {
						fightLogic.attack(game, element, zoneTarget);
					}
				}
			}
		}

		// suicide attack
		var suicideAttack = elementData.passiveSkill[fightLogic.PASSIVE_SKILLS.suicide]; 
		if (suicideAttack != null) {
			element.l -= suicideAttack / 100 * elementData.l;
			tools.addUniqueElementToArray(game.modified, element);
		}

		// poison attack
		var poisonAttack = elementData.passiveSkill[fightLogic.PASSIVE_SKILLS.poison]; 
		if (target.f == gameData.FAMILIES.unit && poisonAttack != null) {
			poisonAttack.type = fightLogic.ACTIVE_BUFF.poison;
			target.buff.push(poisonAttack);
		}
	}
}


/**
*	Basic gathering action.
*/
action.doTheGathering = function (game, element, resource) {
	if(game.iterate % tools.getElementData(element).gatheringSpeed == 0) {

		production.gatherResources(game, element, resource);
		element.fl = gameData.ELEMENTS_FLAGS.mining;

	}
}
