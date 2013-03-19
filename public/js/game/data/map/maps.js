gameData.MAP_TYPES = {
	standard :  {
		id : 0,
		name : 'Standard'
	},
	random : {
		id : 1,
		name : 'Random'
	}
}

gameData.INITIAL_RESOURCES = {
	low : {
		name : 'Low',
		resources : [
			{type : gameData.RESOURCES.wood, value : 50},
			{type : gameData.RESOURCES.gold, value : 50},
			{type : gameData.RESOURCES.stone, value : 30}
		]
	},

	standard : {
		name : 'Standard',
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

gameData.MAP_SIZES = {
	small : {
		name : 'Small',
		x : 80,
		y : 80
	},

	medium : {
		name : 'Medium',
		x : 140,
		y : 140
	},

	large : {
		name : 'Large',
		x : 200,
		y : 200
	}
}

gameData.ZONES = {
	nothing : 0,
	basecamp : 1,
	forest : 2,
	goldmine : 3,
	stonemine : 4,
	water : 5	
}

gameData.VEGETATION_TYPES = {
	standard : {
		name : 'Standard',
		zones : [
			{type : gameData.ZONES.nothing, factor : 20},
			{type : gameData.ZONES.forest, factor : 12},
			{type : gameData.ZONES.goldmine, factor : 1},
			{type : gameData.ZONES.stonemine, factor : 2}
		]
	}
}
