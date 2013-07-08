gameData.ELEMENTS[gameData.FAMILIES.building][gameData.RACES.tomatoes.id] = {
	townhall : {
		name : 'Town Hall',
		r : 0,
		t: 0,
		shape: [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1]],
		timeConstruction: 80,
		buttons: [gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.tomatoes.id].builder],
		needs : [{t : gameData.RESOURCES.wood.id, value : 300}, {t : gameData.RESOURCES.water.id, value : 300}],
		l : 500,
		defense : 0,
		armorType : fightLogic.ARMOR_TYPES.building,
		pop : 8,
		g : 'castle.js',
		image: 'castle.png',
		height: 21,
		buttonId : 10,
		vision : 15,
		lifeBarWidth: 50
	},
	house : {
		name : 'House',
		r : 0,
		t: 1,
		shape: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1 , 1 , 1]],
		timeConstruction: 40,
		buttons: [],
		needs : [{t : gameData.RESOURCES.wood.id, value : 80}],
		l : 100,
		defense : 0,
		armorType : fightLogic.ARMOR_TYPES.building,
		pop : 6,
		g : 'house.js',
		image: 'house.png',
		height: 12,
		buttonId : 11,
		vision : 15,
		lifeBarWidth: 40
	},
	casern : {
		name : 'Casern',
		r : 0,
		t: 2,
		shape: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
		timeConstruction: 60,
		buttons: [gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.tomatoes.id].footman, gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.tomatoes.id].bowman, gameData.ELEMENTS[gameData.FAMILIES.unit][gameData.RACES.tomatoes.id].knight],
		needs : [{t : gameData.RESOURCES.wood.id, value : 200}, {t : gameData.RESOURCES.water.id, value : 200}],
		l : 250,
		defense : 0,
		armorType : fightLogic.ARMOR_TYPES.building,
		pop : 0,
		g : 'casern.js',
		image: 'casern.png',
		height: 18,
		buttonId : 12,
		vision : 15,
		lifeBarWidth: 40
	},
	tower : {
		name : 'Defense Tower',
		r : 0,
		t: 3,
		shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
		timeConstruction: 45,
		buttons: [],
		needs : [{t : gameData.RESOURCES.wood.id, value : 150}, {t : gameData.RESOURCES.water.id, value : 100}],
		l : 200,
		defense : 1,
		armorType : fightLogic.ARMOR_TYPES.building,
		pop : 0,
		g : 'tower.js',
		image: 'tower.png',
		height: 25,
		buttonId : 13,
		vision : 14,
		attackSpeed : 1,
		attack : 6, 
		weaponType : fightLogic.WEAPON_TYPES.piercing,
		range : 20,
		lifeBarWidth: 30
	}
};