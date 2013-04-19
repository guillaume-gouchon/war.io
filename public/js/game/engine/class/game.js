gameData.Game = function () {

	this.stats = [];
	this.players = [];


	/**
	*	Main variable used during the game.
	*  	It contains all the terrain's elements, units and buildings.
	*/
	this.gameElements = [];


	this.modified = [];
	this.added = [];
	this.removed = [];


	/**
	*	Buildings freshly created by the players.
	*	Used to synchronize user's build action with the game engine loop.
	*/
	this.newBuildings = [];


	/**
	*	Tells which tile is occupied and which tile is free.
	*/
	this.grid = [];


	/**
	*	Loop counter.
	*/
	this.iterate = 0;


	/**
	*	Updates the game logic and returns updated elements.
	*/
	this.update = function () {
		this.iterate = (this.iterate > 100 ? 0 : this.iterate + 1);
		return gameLogic.update(this);
	}
}
