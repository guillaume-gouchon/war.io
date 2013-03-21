var userModel = require('../models/user').model;

module.exports = {
	
	userModel: userModel,

	getAll: function(callback){
		userModel.find(callback);
	},

	getById: function(id, callback){
		userModel.findOne({_id: id}, callback);
	},

	save: function(user, callback){
		user.save(callback);
	}
	
}
