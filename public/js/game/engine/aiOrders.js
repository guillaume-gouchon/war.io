var aiOrders = {};

/**
 *      Updates the orders that the AI gives to its units
 */
aiOrders.update = function(game, player) {
    // var player = game.players[0];
    // var playerID = player.o;
    // this.buildHouses(game, player, playerID);
    // this.harvest(game, playerID);
    // this.trainHarvesters(game, playerID);
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
                if (unit.a != null && unit.a.type == action.ACTION_TYPES.build) {
                    return; // Let's build only one at a time...
                }
            }
        }
        var pos = worker.p;
        var i = 0;
        for (var i = 0; i < 10; i++) {
            order.move(game, [worker], parseInt(Math.random() * game.grid[0].length - 1), parseInt(Math.random() * game.grid.length - 1), false);
            var tilesAround = tools.getFreeTilesAroundElements(game, worker);
            for (var n in tilesAround) {
                pos = tilesAround[n];
                var neighbors = tools.getNeighbors(game.grid, pos.x, pos.y);
                for (var j in neighbors) {
                    pos = neighbors[j];
                    if (this.canBeBuiltHere(game, pos, gameData.ELEMENTS[gameData.FAMILIES.building][unit.t][1])) {
                        order.buildThatHere(game, [worker.id], gameData.ELEMENTS[gameData.FAMILIES.building][worker.t][1], pos.x, pos.y, false); 
                        return;
                    }
                }
            }
        }
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
                if (building.q.length < 2) { // Don't queue worker, it's useless
                    order.buy(game, [building.id], gameData.ELEMENTS[gameData.FAMILIES.unit][0][0]);
                }
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
            if (gameData.ELEMENTS[unit.f][unit.r][unit.t].isBuilder && unit.a == null && unit.pa.length == 0 && (unit.mt == null || unit.mt.x == null)) {
                idleWorkers.push(unit);
            }
        }
    }
    // Gather Gold
    for (var i in idleWorkers) {
        if (i < idleWorkers.length / 2) {// Gather Gold
            var nearestHarvestable = tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, 1, null, false);
            if (nearestHarvestable != null) {
                order.gather(game, [idleWorkers[i]], tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, 1, null, false), false);
            }
        }
        else {// Gather Wood
            var nearestHarvestable = tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, 1, null, false);
            if (nearestHarvestable != null) {
                order.gather(game, [idleWorkers[i]], tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, 0, null, false), false);
            }
        }
    }
};


/**
*   Is there something under any part of this element ?
*/
aiOrders.canBeBuiltHere = function (game, position, building) {
    building.p = position;
    var point1 = tools.getPartPosition(building, 0, 0);
    var point2 = {
        x : point1.x + building.shape[0].length - 1,
        y : point1.y + building.shape.length - 1
    };

    for (var i = point1.x; i <= point2.x; i++) {
        for (var j = point1.y; j <= point2.y; j++) {
            if (game.grid[i] != null && game.grid[i][j] != null && game.grid[i][j].c > 0) {
                return false;
            }
        }
    }
    return true;
};
