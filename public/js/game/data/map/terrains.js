gameData.ELEMENTS[gameData.FAMILIES.terrain].push(
[
	{
		name : 'Tree',
		t : 0,
		shape : [[1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.wood.id,
		ra : 75,
		g : 'tree.js',
		image : 'forest.png'
	},
	{
		name : 'Stone Mine',
		t : 1,
		shape : [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
		canMoveIn : false,
		//resourceType : gameData.RESOURCES.stone.id,
		ra : 500,
		g : 'stonemine.js',
		image : 'stone.png'
	},
	{	
		name : 'Gold Mine',
		t : 2,
		shape : [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.gold.id,
		ra : 3000,
		g : 'goldmine.js',
		image : 'gold-mine.png'
	}
]);