var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    nbPlayers: Number,
    type: Number,
    size: String,
    vegetation: String,
    initialResources: String,
    players: Array,
    status: Number
});

module.exports = {
	model : mongoose.model('Game', schema)
}