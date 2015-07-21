var accessors = {};


accessors.getStat = function (players, owner, elementData, stat) {
	var n = null;
	switch (stat) {
		case fightLogic.STATS_BUFF.attack:
		 	n = elementData.attack;
			break;
		case fightLogic.STATS_BUFF.defense:
		 	n = elementData.defense;
			break;
		case fightLogic.STATS_BUFF.attackSpeed:
		 	n = elementData.attackSpeed;
			break;
		case fightLogic.STATS_BUFF.speed:
		 	n = elementData.speed;
			break;
		case fightLogic.STATS_BUFF.range:
		 	n = elementData.range;
			break;
		case fightLogic.STATS_BUFF.vision:
		 	n = elementData.vision;
			break;
	}
	for (var i in elementData.techs) {
		var tech = elementData.techs[i];
		var techData = gameData.ELEMENTS[gameData.FAMILIES.research][players[owner].r][tech];
		for (var j in techData.addStats) {
			if (techData.addStats[j].stat == stat && players[owner].tec.indexOf(tech) >= 0) {
				n += parseInt(techData.addStats[j].value);
			}
		}
	}
	return n;
};