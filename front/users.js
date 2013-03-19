var async = require('async');

module.exports = function(app) {

	var geoip = require('geoip-lite');

	// GET USER BY ID
	app.get('/users/:id', function (req, res) {
		app.userDao.getUserById(req.params.id, function (err, user){
			if(user != null){
				return res.send(user);		
	    	} else{
	    		return res.send(0);
	    	}
		});
	});

	// GET ALL USERS
	app.get('/users', function (req, res) {
		app.userDao.getAllUsers(function (err, users){
			return res.send(users);	
		});
	});

	// CREATE NEW PLAYER
	app.post('/users', function (req, res) {
  		var login = req.body.login;
  		var password = req.body.password;
		var nationality = req.body.nationality;
		var geo = geoip.lookup(req.connection.remoteAddress);
		if(geo != null){
			nationality = geo.country.toLowerCase();
		}
		var user = new app.userDao.userModel({
		    login: login,
		    password: password,
		    nationality: nationality
	    });
	  	app.userDao.saveUser(user, function (err){
	  		if(!err){
	      		console.log("New user created with login : ".api + login + ", nationality = ".api + nationality);
				return res.send(user);
	      	} else {
	      		return res.send(-1);
	      	}
	  	});
	});

};
