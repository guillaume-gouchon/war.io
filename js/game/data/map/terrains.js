gameData.TERRAINS = {
	tree : {
		type : 1,
		color: '#0f0',
		shape : [[1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.wood,
		resourceAmount : 75
	},
	stone : {
		type : 2,
		color : '#000',
		shape : [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.stone,
		resourceAmount : 500
	},
	gold : {
		color : '#fc1',
		shape : [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.gold,
		resourceAmount : 3000
	}
}