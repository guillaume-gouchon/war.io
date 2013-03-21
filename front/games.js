module.exports = function(app) {


	// GET GAME BY ID
	app.get('/games/:id', function (req, res) {
		app.gameDao.getById(req.params.id, function (err, game){
			if(game != null){
				return res.send(game);		
	    	} else{
	    		return res.send(-1);
	    	}
		});
	});

	// GET ALL GAMES
	app.get('/games', function (req, res) {
		app.gameDao.getAll(function (err, games){
			return res.send(games);	
		});
	});

	// CREATE NEW GAME
	app.post('/games', function (req, res) {
		
  		var type = req.body.type;
  		var nbPlayers = req.body.nbPlayers;
		var size = req.body.size;
		var vegetation = req.body.vegetation;
		var initialResources = req.body.initialResources;
		var status = 0;

		var game = new app.gameDao.model({
		    type: type,
		    nbPlayers: nbPlayers,
		    size: size,
		    vegetation: vegetation,
		    initialResources: initialResources,
		    status: status
	    });

	  	app.gameDao.save(game, function (err){
	  		if(!err){
	      		console.log("New game created".api);
				return res.send(game);
	      	} else {
	      		return res.send(-1);
	      	}
	  	});
	});

};
