module.exports = function(app) {

	app.userDao = require('./userDao');
	app.gameDao = require('./gameDao');

}