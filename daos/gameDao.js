var gameModel = require('../models/game').model;

module.exports = {
	
	gameModel: gameModel,

	getAll: function (callback) {
		gameModel.find(callback);
	},

	getById: function (id, callback) {
		gameModel.findOne({_id: id}, callback);
	},


	save: function (game, callback) {
		game.save(callback);
	},

	getByStatus: function (status, callback) {
		gameModel.find({status: status}, callback);
	}
	
}
