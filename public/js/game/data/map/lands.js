	gameData.ELEMENTS[gameData.FAMILIES.land].push(
{
	goldmine : {	
		name : 'Gold Mine',
		t : 0,
		shape : [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.water.id,
		ra : 3000,
		g : 'goldmine',
		gui : 'ic_goldmine.png',
		minimapColor : {r:237,g:226,b:117}
	},
	tree : {
		name : 'Tree',
		t : 1,
		shape : [[1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.wood.id,
		ra : 75,
		g : 'tree',
		gui : 'ic_tree.png',
		minimapColor : {r:52,g:114,b:53}
	},
	water : {	
		name : 'Water',
		t : 2,
		shape : [[1]],
		canMoveIn : false,
		sta : true,
		minimapColor : {r:43,g:56,b:86}
	},
	highgrass : {	
		name : 'High Grass',
		t : 'highgrass',
		shape : [[1]],
		canMoveIn : true,
		sta : true,
		g : 'highgrass',
		minimapColor : null
	}
});