var aiOrders = {};


/**
 *      Updates the orders that the AI gives to its units
 */
aiOrders.update = function(game, player) {
    //var player = game.players[0];
    var playerID = player.o;
    this.buildHouses(game, player, playerID);
    this.harvest(game, playerID);
    this.trainHarvesters(game, playerID);
};


/**
 *      Build Houses
 */
aiOrders.buildHouses = function(game, player, playerID) {
    if (player.pop.current > player.pop.max - 8) {
        var worker = null;
        var n = 0;
        for (var n in game.gameElements.unit) {
            var unit = game.gameElements.unit[n];
            if (unit.o == playerID && gameData.ELEMENTS[unit.f][unit.r][unit.t].isBuilder) {
                worker = unit;
            }
        }
        //console.log(worker)
        pos = tools.getFreeTilesAroundElements(game, utils.getElementFromId(worker.id))[0];
        order.buildThatHere(game, [unit.id], gameData.ELEMENTS[gameData.FAMILIES.building][unit.t][1], pos.x, pos.y, true); 
    }

};


/**
 *      Train Harvesters
 */
aiOrders.trainHarvesters = function(game, playerID) {
    for (var n in game.gameElements.building) {
        var building = game.gameElements.building[n];
        if (building.o == playerID) {
            if (gameData.ELEMENTS[building.f][building.r][building.t].name == 'Town Hall') {
                order.buy(game, [building.id], gameData.ELEMENTS[gameData.FAMILIES.unit][0][0]);
            }
        }
    }
};



/**
 *      More or less evenly haverst Wood and gold
 */
aiOrders.harvest = function(game, playerID) {
    var idleWorkers = [];
    for (var n in game.gameElements.unit) {
        var unit = game.gameElements.unit[n];
        if (unit.o == playerID) {
            if (gameData.ELEMENTS[unit.f][unit.r][unit.t].isBuilder && unit.a == null && (unit.mt == null || unit.mt.x == null)) {
                idleWorkers.push(unit);
            }
        }
    }
    // Gather Gold
    for (var i in idleWorkers) {
        if (i < idleWorkers.length / 2) {// Gather Gold
            order.gather(game, [idleWorkers[i]], tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, 1, null, false));
        }
        else {// Gather Wood
            order.gather(game, [idleWorkers[i]], tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, 0, null, false));
        }
    }
};
