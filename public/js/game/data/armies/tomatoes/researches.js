gameData.ELEMENTS[gameData.FAMILIES.research][gameData.RACES.tomatoes.id] = {
	doublekatana: {
		f: gameData.FAMILIES.research,
		r: gameData.RACES.tomatoes.id,
		t: 'doublekatana',
		name: 'Double katana',
		tooltip: 'Double Katana (+ 5 atk)',
		timeConstruction: 5,
		needs: [{t: gameData.RESOURCES.wood.id, value: 10}, {t: gameData.RESOURCES.water.id, value: 10}, {t: gameData[gameData.FAMILIES.building][gameData.RACES.lemon.id].house.t}],
		gui: 'ic_lemon_mothertree.png',
		targetFamily: null,
		targetTypes: [gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.tomatoes.id].baseUnit1],
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
		targetFamily: null,
		targetTypes: [gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.tomatoes.id].baseUnit1],
		addPassiveSkills: [],
		addStats: [{stat: fightLogic.STATS_BUFF.attack, value: 5}]
	}
};