gameData.ELEMENTS[gameData.FAMILIES.research][gameData.RACES.tomatoes.id] = {
	doublekatana: {
		f: gameData.FAMILIES.research,
		r: gameData.RACES.tomatoes.id,
		t: 'doublekatana',
		name: 'Double katana',
		tooltip: 'Double Katana (+ 5 atk)',
		timeConstruction: 5,
		needs: [{t: gameData.RESOURCES.wood.id, value: 10}, {t: gameData.RESOURCES.water.id, value: 10}, {t: 'house'}],
		gui: 'ic_lemon_mothertree.png',
		addPassiveSkills: [],
		addStats: [{stat: fightLogic.STATS_BUFF.attack, value: 5}]
	},
	triplekatana: {
		f: gameData.FAMILIES.research,
		r: gameData.RACES.tomatoes.id,
		t: 'triplekatana',
		name: 'Double katana',
		tooltip: 'Double Katana (+ 5 atk)',
		timeConstruction: 10,
		needs: [{t: gameData.RESOURCES.wood.id, value: 20}, {t: gameData.RESOURCES.water.id, value: 20}, {t: 'doublekatana'}],
		gui: 'ic_lemon_mothertree.png',
		addPassiveSkills: [],
		addStats: [{stat: fightLogic.STATS_BUFF.attack, value: 5}]
	}
};