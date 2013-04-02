gameData.ELEMENTS[gameData.FAMILIES.terrain].push(
[
	{
		name : 'tree',
		t : 0,
		c : 0x00ff00,
		shape : [[1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.wood.id,
		ra : 75,
		g : 'tree.js'
	},
	{
		name : 'stone',
		t : 1,
		c : 0x00ff00,
		shape : [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.stone.id,
		ra : 500,
		g : 'stonemine.js'
	},
	{	
		name : 'gold',
		t : 2,
		c : 0xffcc11,
		shape : [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.gold.id,
		ra : 3000,
		g : 'goldmine.js'
	}
]);