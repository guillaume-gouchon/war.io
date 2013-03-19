gameData.ELEMENTS[gameData.FAMILIES.terrain].push(
[
	{
		name : 'tree',
		type : 0,
		color: '#0f0',
		shape : [[1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.wood,
		resourceAmount : 75
	},
	{
		name : 'stone',
		type : 1,
		color : '#000',
		shape : [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.stone,
		resourceAmount : 500
	},
	{	
		name : 'gold',
		type : 2,
		color : '#fc1',
		shape : [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.gold,
		resourceAmount : 3000
	}
]);