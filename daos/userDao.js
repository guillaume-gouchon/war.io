var userModel = require('../models/user').userModel;

module.exports = {
	
	userModel: userModel,

	getAllUsers: function(callback){
		userModel.find(callback);
	},

	getUserById: function(id, callback){
		userModel.findOne({_id: id}, callback);
	},

	saveUser: function(user, callback){
		user.save(callback);
	}
	
}
