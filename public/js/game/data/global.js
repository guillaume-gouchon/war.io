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
	water : {
		id: 0,
		name : 'Water',
		image : 'ic_water.png'
	},
	wood : {
		id: 1,
		name : 'Wood',
		image : 'ic_wood.png'
	}
}


/**
*	The victory conditions.
*/
gameData.VICTORY_CONDITIONS = {
	annihilation : {
		id: 0,
		name: 'Annihilation',
		description: 'Destroy all the enemies\' buildings'
	}, 
	takeandhold : {
		id: 1,
		name: 'Take and Hold',
		description: 'Capture two-third of the strategic points and retain control of them for 3 minutes'
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
	updateQueue: 5,
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
	rejoinGame : 6,
	sendOrder : 10
}


/**
*	List of cool random names.
*/
gameData.DEFAULT_NAMES = ['Colonel Heinz', 'Juice Master', 'Lord Bobby', 'Lemon Alisa',
						'The Red Baron', 'Tom Boy', 'Tommy Toe', 'Lee Mon', 'Sigmund Fruit'];


/**
*	Returns a fun random name.
*/
gameData.getRandomName = function () {
	return this.DEFAULT_NAMES[parseInt(Math.random() * this.DEFAULT_NAMES.length)];
}


/**
*	List of buttons.
*/
gameData.BUTTONS = {
	build : {
		buttonId : 1000,
		name: 'Build (B)',
		image : 'bg_build_btn.png', 
		isEnabled : true
	},
	back : {
		buttonId : 1001,
		name: 'Back (ESC)',
		image : 'bg_back_btn.png', 
		isEnabled : true
	},
	cancel : {
		buttonId : 1002,
		name: 'Cancel (ESC)',
		image : 'bg_cancel_btn.png', 
		isEnabled : true
	}
}
