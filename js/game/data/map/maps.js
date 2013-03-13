gameData.INITIAL_RESOURCES = {
	low : {
		name : 'Low',
		resources : [
			{type : gameData.RESOURCES.wood, value : 50},
			{type : gameData.RESOURCES.gold, value : 50},
			{type : gameData.RESOURCES.stone, value : 30}
		]
	},

	medium : {
		name : 'Medium',
		resources : [
			{type : gameData.RESOURCES.wood, value : 100},
			{type : gameData.RESOURCES.gold, value : 100},
			{type : gameData.RESOURCES.stone, value : 80}
		]
	},

	high : {
		name : 'High',
		resources : [
			{type : gameData.RESOURCES.wood, value : 250},
			{type : gameData.RESOURCES.gold, value : 250},
			{type : gameData.RESOURCES.stone, value : 100}
		]
	}
}

gameData.RANDOM_MAPS = {
	small : {
		name : 'Small',
		size : {
			x : 80,
			y : 80
		},
		initialResources : gameData.INITIAL_RESOURCES.medium
	},

	medium : {
		name : 'Medium',
		size : {
			x : 140,
			y : 140
		},
		initialResources : gameData.INITIAL_RESOURCES.medium
	},

	large : {
		name : 'Large',
		size : {
			x : 200,
			y : 200
		},
		initialResources : gameData.INITIAL_RESOURCES.medium
	}
}

