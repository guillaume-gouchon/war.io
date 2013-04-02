gameData.ELEMENTS[gameData.FAMILIES.building].push(
[
	{
		name : 'townhall',
		r : 0,
		t: 0,
		shape: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
		timeConstruction: 60,
		constructionColors: [0x00f00, 0x00f00, 0x00f00, 0x00f00],
		buttons: [gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human.id][0]],
		needs : [{t : gameData.RESOURCES.wood.id, value : 100}, {t : gameData.RESOURCES.stone.id, value : 100}],
		l : 500,
		defense : 3,
		armorType : 1,
		pop : 8,
		g : 'castle.js',
		image: 'townhall.png'
	},
	{
		name : 'house',
		r : 0,
		t: 1,
		shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
		timeConstruction: 20,
		constructionColors: [0x00f00, 0x00f00, 0x00f00, 0x00f00],
		buttons: [],
		needs : [{t : gameData.RESOURCES.wood.id, value : 50}],
		l : 100,
		defense : 1,
		armorType : 1,
		pop : 5,
		g : 'castle.js',
		image: 'house.png'
	},
	{
		name : 'casern',
		r : 0,
		t: 2,
		shape: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 0]],
		timeConstruction: 40,
		constructionColors: [0x00f00, 0x00f00, 0x00f00, 0x00f00],
		buttons: [gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human.id][1], gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human.id][2]],
		needs : [{t : gameData.RESOURCES.wood.id, value : 100}, {t : gameData.RESOURCES.stone.id, value : 50}],
		l : 250,
		defense : 2,
		armorType : 1,
		g : 'castle.js',
		image: 'casern.png'
	}
]);