gameData.ELEMENTS[gameData.FAMILIES.research][gameData.RACES.tomatoes.id] = {
	bastardsword: {
		f: gameData.FAMILIES.research,
		r: gameData.RACES.tomatoes.id,
		t: 'bastardsword',
		tooltip: 'Bastard Sword (T)<p>+ 5 Atk to Swordsmen</p>',
		timeConstruction: 15,
		needs: [{t: gameData.RESOURCES.gold.id, value: 100}, {t: gameData.RESOURCES.wood.id, value: 80}],
		g: 'bastardsword',
		addPassiveSkills: [],
		addStats: [{stat: fightLogic.STATS_BUFF.attack, value: 5}],
		shortcut: 84
	},
	leatherarmor: {
		f: gameData.FAMILIES.research,
		r: gameData.RACES.tomatoes.id,
		t: 'leatherarmor',
		tooltip: 'Leather Armor (L)<p>+ 5 Def to Swordsmen</p>',
		timeConstruction: 20,
		needs: [{t: gameData.RESOURCES.gold.id, value: 150}, {t: gameData.RESOURCES.wood.id, value: 100}],
		g: 'leatherarmor',
		addPassiveSkills: [],
		addStats: [{stat: fightLogic.STATS_BUFF.defense, value: 5}],
		shortcut: 76
	},
	longbow: {
		f: gameData.FAMILIES.research,
		r: gameData.RACES.tomatoes.id,
		t: 'longbow',
		tooltip: 'Long Bow (G)<p>+ 5 Range to Bowmen</p>',
		timeConstruction: 20,
		needs: [{t: gameData.RESOURCES.gold.id, value: 100}, {t: gameData.RESOURCES.wood.id, value: 200}],
		g: 'longbow',
		addPassiveSkills: [],
		addStats: [{stat: fightLogic.STATS_BUFF.range, value: 5}],
		shortcut: 71
	},
	spikedmace: {
		f: gameData.FAMILIES.research,
		r: gameData.RACES.tomatoes.id,
		t: 'spikedmace',
		tooltip: 'SpikedMace (M)<p>+ 10 Atk to Knights</p>',
		timeConstruction: 20,
		needs: [{t: gameData.RESOURCES.gold.id, value: 250}, {t: gameData.RESOURCES.wood.id, value: 200}, {t: 'factory'}],
		g: 'spikedmace',
		addPassiveSkills: [],
		addStats: [{stat: fightLogic.STATS_BUFF.attack, value: 10}],
		shortcut: 77
	}
};
