module.exports = function(app) {

	var geoip = require('geoip-lite');

	// GET USER BY ID
	app.get('/users/:id', function (req, res) {
		app.userDao.getById(req.params.id, function (err, user){
			if(user != null){
				return res.send(user);		
	    	} else{
	    		return res.send(-1);
	    	}
		});
	});

	// GET ALL USERS
	app.get('/users', function (req, res) {
		app.userDao.getAll(function (err, users){
			return res.send(users);	
		});
	});

	// CREATE NEW PLAYER
	app.post('/users', function (req, res) {
  		var login = req.body.login;
		var geo = geoip.lookup(req.connection.remoteAddress);
		if(geo != null){
			nationality = geo.country.toLowerCase();
		}
		var user = new app.userDao.model({
		    login: login,
		    nationality: nationality
	    });
	  	app.userDao.save(user, function (err){
	  		if(!err){
	      		console.log("New user created with login : ".api + login + ", nationality = ".api + nationality);
				return res.send(user);
	      	} else {
	      		return res.send(-1);
	      	}
	  	});
	});

};
