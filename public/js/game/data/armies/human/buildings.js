gameData.ELEMENTS[gameData.FAMILIES.building].push(
[
	{
		name : 'Town Hall',
		r : 0,
		t: 0,
		shape: [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1]],
		timeConstruction: 60,
		buttons: [gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human.id][0]],
		needs : [{t : gameData.RESOURCES.wood.id, value : 100}, {t : gameData.RESOURCES.gold.id, value : 100}],
		l : 500,
		defense : 3,
		armorType : 1,
		pop : 8,
		g : 'castle.js',
		image: 'townhall.png',
		height: 22,
		buttonId : 10
	},
	{
		name : 'House',
		r : 0,
		t: 1,
		shape: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1 , 1 , 1]],
		timeConstruction: 20,
		buttons: [],
		needs : [{t : gameData.RESOURCES.wood.id, value : 50}],
		l : 100,
		defense : 1,
		armorType : 1,
		pop : 5,
		g : 'habitation.js',
		image: 'house.png',
		height: 12,
		buttonId : 11
	},
	{
		name : 'Casern',
		r : 0,
		t: 2,
		shape: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
		timeConstruction: 40,
		buttons: [gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human.id][1], gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human.id][2], gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human.id][3]],
		needs : [{t : gameData.RESOURCES.wood.id, value : 100}, {t : gameData.RESOURCES.gold.id, value : 50}],
		l : 250,
		defense : 2,
		armorType : 1,
		pop : 0,
		g : 'barrack.js',
		image: 'casern.png',
		height: 14,
		buttonId : 12
	}
]);