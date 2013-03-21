gameData.ELEMENTS[gameData.FAMILIES.building].push(
[
	{
		name : 'townhall',
		r : 0,
		t: 0,
		shape: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
		timeConstruction: 60,
		constructionColors: ['#000', '#555', '#888', '#ccc'],
		buttons: [gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human][0]],
		needs : [{t : gameData.RESOURCES.wood, value : 100}, {t : gameData.RESOURCES.stone, value : 100}],
		l : 500,
		defense : 3,
		armorType : 1,
		pop : 8
	},
	{
		name : 'house',
		r : 0,
		t: 1,
		shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
		timeConstruction: 20,
		constructionColors: ['#000', '#555', '#888', '#ccc'],
		buttons: [],
		needs : [{t : gameData.RESOURCES.wood, value : 50}],
		l : 100,
		defense : 1,
		armorType : 1,
		pop : 5
	},
	{
		name : 'casern',
		r : 0,
		t: 2,
		shape: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 0]],
		timeConstruction: 40,
		constructionColors: ['#000', '#555', '#888', '#ccc'],
		buttons: [gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human][1], gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human][2]],
		needs : [{t : gameData.RESOURCES.wood, value : 100}, {t : gameData.RESOURCES.stone, value : 50}],
		l : 250,
		defense : 2,
		armorType : 1
	}
]);