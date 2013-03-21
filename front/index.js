module.exports = function(app) {

	require('./users')(app);
	require('./games')(app);

}