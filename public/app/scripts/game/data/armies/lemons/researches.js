gameData.ELEMENTS[gameData.FAMILIES.research][gameData.RACES.lemons.id] = {
	doublekatana: {
		f: gameData.FAMILIES.research,
		t: 'doublekatana',
		r: gameData.RACES.lemons.id,
		name: 'Double katana',
		tooltip: 'Double Katana (+ 5 atk)',
		timeConstruction: 60,
		needs: [{t: gameData.RESOURCES.wood.id, value: 50}, {t: gameData.RESOURCES.gold.id, value: 50}],
		gui: 'ic_lemon_mothertree.png'
	},
	triplekatana: {
		f: gameData.FAMILIES.research,
		t: 'triplekatana',
		r: gameData.RACES.lemons.id,
		name: 'Double katana',
		tooltip: 'Double Katana (+ 5 atk)',
		timeConstruction: 60,
		needs: [{t: gameData.RESOURCES.wood.id, value: 100}, {t: gameData.RESOURCES.gold.id, value: 100}, {t: 'doublekatana'}],
		gui: 'ic_lemon_mothertree.png'
	}
};