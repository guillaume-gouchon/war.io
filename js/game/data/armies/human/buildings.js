gameData.HUMAN_BUILDINGS = {
	townhall : {
		type: 0,
		shape: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
		timeConstruction: 60,
		constructionColors: ['#000', '#555', '#888', '#ccc'],
		buttons: [gameData.HUMAN_UNITS.builder],
		needs : [],
		life : 500,
		defense : 3,
		armorType : 1
	},
	house : {
		type: 1,
		shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
		timeConstruction: 20,
		constructionColors: ['#000', '#555', '#888', '#ccc'],
		buttons: [],
		needs : [],
		life : 100,
		defense : 1,
		armorType : 1
	},
	casern : {
		type: 2,
		shape: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 0]],
		timeConstruction: 40,
		constructionColors: ['#000', '#555', '#888', '#ccc'],
		buttons: [gameData.HUMAN_UNITS.swordsman, gameData.HUMAN_UNITS.knight],
		needs : [],
		life : 250,
		defense : 2,
		armorType : 1
	}
}