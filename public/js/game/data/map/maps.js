gameData.ZONES = {
	nothing : 0,
	basecamp : 1,
	forest : 2,
	goldmine : 3,
	highgrass : 4,
	water : 5
}

gameData.MAP_TYPES = {
	random: {
		id: 0,
		name: 'Random'
	},
	standard:  {
		id: 1,
		name: 'Standard',
		map: [
			[1, 4, 0, 2, 2, 2, 0, 4, 1],
			[0, 3, 0, 0, 2, 0, 0, 3, 0],
			[0, 2, 0, 0, 0, 0, 0, 2, 0],
			[2, 0, 2, 0, 3, 0, 2, 0, 2],
			[2, 0, 2, 0, 2, 0, 2, 0, 2],
			[2, 0, 2, 0, 3, 0, 2, 0, 2],
			[0, 2, 0, 2, 0, 2, 0, 2, 0],
			[0, 2, 0, 0, 0, 0, 0, 2, 0],
			[0, 3, 0, 0, 2, 0, 0, 3, 0],
			[1, 4, 0, 2, 2, 2, 0, 4, 1]
		]
	}
}

gameData.INITIAL_RESOURCES = {
	low : {
		id : 0,
		name : 'Low',
		re : [
			{t : gameData.RESOURCES.wood.id, value : 50},
			{t : gameData.RESOURCES.water.id, value : 50}
		]
	},

	standard : {
		id : 1,
		name : 'Standard',
		re : [
			{t : gameData.RESOURCES.wood.id, value : 100},
			{t : gameData.RESOURCES.water.id, value : 100}
		]
	},

	high : {
		id : 2,
		name : 'High',
		re : [
			{t : gameData.RESOURCES.wood.id, value : 250},
			{t : gameData.RESOURCES.water.id, value : 250}
		]
	}
}

gameData.MAP_SIZES = {
	small : {
		id : 0,
		name : 'Small',
		x : 100,
		y : 100
	},
	medium : {
		id : 1,
		name : 'Medium',
		x : 140,
		y : 140
	},

	large : {
		id : 2,
		name : 'Large',
		x : 180,
		y : 180
	}
}

gameData.VEGETATION_TYPES = {
	standard : {
		id : 0,
		name : 'Standard',
		zones : [
			{t : gameData.ZONES.nothing, factor : 20},
			{t : gameData.ZONES.forest, factor : 12},
			{t : gameData.ZONES.goldmine, factor : 1}
		]
	}
}
