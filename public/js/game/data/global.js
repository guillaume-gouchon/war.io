/**
*	The different races available.
*/
gameData.RACES = {
	tomatoes : {
		id: 0,
		name : 'Tomatoes',
		image : 'human.png'
	},
	lemons : {
		id: 1,
		name : 'Lemons',
		image : 'human.png'
	}
}


/**
*	The different resources.
*/
gameData.RESOURCES = {
	wood : {
		id: 0,
		name : 'wood',
		image : 'wood.png'
	},
	gold : {
		id: 1,
		name : 'gold',
		image : 'gold.png'
	}
}


/**
*	List of the different types of socket exchanged between the client and the server.
*/
gameData.TO_CLIENT_SOCKET = {
	listJoinableGames : 0,
	updateLoadingProgress : 1,
	gameStart : 2,
	rejoin : 3,
	login : 4,
	gameData : 10,
	gameStats : 11
}

gameData.TO_SERVER_SOCKET = {
	login : 0,
	createNewGame : 1,
	enterSalon : 2,
	leaveSalon : 3,
	joinGame : 4,
	updateLoadingProgress : 5,
	sendOrder : 10
}


gameData.DEFAULT_NAMES = ['Colonel Heinz', 'Juice Master', 'Lord Bobby', 'Lemon Alisa',
						'The Red Baron', 'Tom Boy', 'Tommy Toe', 'Lee Mon', 'Sigmund Fruit'];


/**
*	Returns a random fun name.
*/
gameData.getRandomName = function () {
	return this.DEFAULT_NAMES[parseInt(Math.random() * this.DEFAULT_NAMES.length)];
}
