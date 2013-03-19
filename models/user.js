var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    login: String,
    password: {type: String, select: false},
    nationality: String
});

var userModel = mongoose.model('User', userSchema);

module.exports = {
	userModel: userModel
}