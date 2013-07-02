gameData.ELEMENTS[gameData.FAMILIES.land].push(
{
	tree : {
		name : 'Tree',
		t : 0,
		shape : [[1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.wood.id,
		ra : 75,
		g : 'tree.js',
		image : 'forest.png',
		minimapColor : {r:52,g:114,b:53},
	},
	goldmine : {	
		name : 'Gold Mine',
		t : 1,
		shape : [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.gold.id,
		ra : 3000,
		g : 'goldmine.js',
		image : 'gold-mine.png',
		minimapColor : {r:237,g:226,b:117},
	},
	water : {	
		name : 'Water',
		t : 2,
		shape : [[1]],
		canMoveIn : false,
		sta : true,
		minimapColor : {r:43,g:56,b:86},
	}
});