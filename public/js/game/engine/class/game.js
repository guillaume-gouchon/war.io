gameData.Game = function () {

	this.stats = [];

	this.players = [];


	/**
	*	Tells which tile is occupied and which tile is free.
	*/
	this.grid = [];


	/**
	*	Main variable used during the game.
	*  	It contains all the land's elements, units and buildings.
	*/
	this.gameElements = {
		land: {},
		building: {},
		unit: {}
	};


	/**
	*	Buildings freshly created by the players.
	*	Used to synchronize user's actions with the game engine loop.
	*/
	this.newBuildings = [];
	this.cancelBuildings = [];
	this.cancel = [];
	this.orders = [];


	/**
	*	Data sent to the client.
	*/
	this.modified = [];
	this.added = [];
	this.removed = [];


	/**
	*	New chat messages to spread.
	*/
	this.chat = [];


	/**
	*	Loop counter.
	*/
	this.iterate = -1;


	/**
	*	Updates the game logic and returns updated elements.
	*/
	this.update = function () {
		this.iterate = (this.iterate > 100 ? 0 : this.iterate + 1);
		var result = gameLogic.update(this);
		return result;
	}
}
