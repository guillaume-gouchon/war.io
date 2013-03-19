gameData.ELEMENTS[gameData.FAMILIES.building].push(
[
	{
		name : 'townhall',
		race : 0,
		type: 0,
		shape: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
		timeConstruction: 60,
		constructionColors: ['#000', '#555', '#888', '#ccc'],
		buttons: [gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human][0]],
		needs : [{type : gameData.RESOURCES.wood, value : 100}, {type : gameData.RESOURCES.stone, value : 100}],
		life : 500,
		defense : 3,
		armorType : 1,
		population : 8
	},
	{
		name : 'house',
		race : 0,
		type: 1,
		shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
		timeConstruction: 20,
		constructionColors: ['#000', '#555', '#888', '#ccc'],
		buttons: [],
		needs : [{type : gameData.RESOURCES.wood, value : 50}],
		life : 100,
		defense : 1,
		armorType : 1,
		population : 5
	},
	{
		name : 'casern',
		race : 0,
		type: 2,
		shape: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 0]],
		timeConstruction: 40,
		constructionColors: ['#000', '#555', '#888', '#ccc'],
		buttons: [gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human][1], gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.human][2]],
		needs : [{type : gameData.RESOURCES.wood, value : 100}, {type : gameData.RESOURCES.stone, value : 50}],
		life : 250,
		defense : 2,
		armorType : 1
	}
]);