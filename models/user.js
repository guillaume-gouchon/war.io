var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    login: String,
    nationality: String,
    played: {type: Number, default: 0},
    victory: {type: Number, default: 0}
});

module.exports = {
	model : mongoose.model('User', schema)
}