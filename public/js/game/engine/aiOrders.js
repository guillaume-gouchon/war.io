var aiOrders = {};

/**
 *      Updates the orders that the AI gives to its units
 */
aiOrders.update = function(game, player) {
    var player = game.players[0];
    var playerID = player.o;
    this.buildHouses(game, player, playerID);
    this.harvest(game, player, playerID);
    this.trainHarvesters(game, playerID);
    this.trainSoldiers(game, player, playerID);
    this.buildRax(game, player, playerID);
    this.finishBuildings(game, playerID);
    //this.buildTownHall(game, player, playerID);
};


/**********************************************************
 **********************************************************
 *                      BUILDINGS
 **********************************************************
 *********************************************************/

/**
 *      Build Rax
 */
aiOrders.buildRax = function(game, player, playerID) {
    var rax = gameData.ELEMENTS[gameData.FAMILIES.building][0][2];
    if (player.re[0] > rax.needs[0].value && player.re[1] > rax.needs[1].value) {
        var worker = null;
        var n = 0;
        for (var n in game.gameElements.unit) {
            var unit = game.gameElements.unit[n];
            if (this.isHarvestingOrIdleWorker(unit, playerID)) {
                worker = unit;
            }
        }
        if (worker == null) { //no idle worker available
            return;
        }
        var pos = worker.p;
        var i = 0;
        try {
            for (var i = 0; i < 10; i++) {
                pos = worker.p;
                order.move(game, [worker], parseInt(Math.random() * game.grid[0].length - 1), parseInt(Math.random() * game.grid.length - 1), true);
                var tilesAround = tools.getFreeTilesAroundElements(game, worker);
                for (var n in tilesAround) {
                    var neighbors = tools.getNeighbors(game.grid, pos.x, pos.y);
                    for (var j in neighbors) {
                        pos = neighbors[j];
                        if (this.canBeBuiltHere(game, pos, rax)) {
                            order.buildThatHere(game, [worker.id], rax, pos.x, pos.y, true); 
                        }
                    }
                }
            }
        }
        catch(err) {
            return; //??!!! :'(
        }
    }
};


/**
 *      Build Town Hall
 *      TODO: Doesn't work...
 */
aiOrders.buildTownHall = function(game, player, playerID) {
    if (player.pop.current > player.pop.max - 8) {
        var worker = null;
        var n = 0;
        for (var n in game.gameElements.unit) {
            var unit = game.gameElements.unit[n];
            if (this.isHarvestingOrIdleWorker(unit, playerID)) {
                worker = unit;
            }
        }
        if (worker == null) { //no idle worker available
            return;
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
                    if (this.canBeBuiltHere(game, pos, gameData.ELEMENTS[gameData.FAMILIES.building][worker.t][0])) {
                        order.buildThatHere(game, [worker.id], gameData.ELEMENTS[gameData.FAMILIES.building][worker.t][0], pos.x, pos.y, false); 
                        return;
                    }
                }
            }
        }
    }
};


/**
 *      Build Houses
 */
aiOrders.buildHouses = function(game, player, playerID) {
    var house = gameData.ELEMENTS[gameData.FAMILIES.building][0][1];
    if (player.re[0] > house.needs[0].value && player.pop.current > player.pop.max - 8) {
        var worker = null;
        var n = 0;
        for (var n in game.gameElements.unit) {
            var unit = game.gameElements.unit[n];
            //if (this.isIdleWorker(unit, playerID)) {
            if (this.isHarvestingOrIdleWorker(unit, playerID)) {
                worker = unit;
            }
        }
        if (worker == null) { //no idle worker available
            return;
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
                    if (this.canBeBuiltHere(game, pos, house)) {
                        try {
                            order.buildThatHere(game, [worker.id], house, pos.x, pos.y, false); 
                            return;
                        }
                        catch(err) {
                            return; // ?!?? :-(
                        }
                    }
                }
            }
        }
    }
};


/*
 *      Finish unfinished buildings
 *      This function shouldn't be needed, but meeeh
 */
aiOrders.finishBuildings = function(game, playerID) {
    for (var n in game.gameElements.building) {
        var building = game.gameElements.building[n];
        if (building.o == playerID && building.l < 2) { // building with 1 HP
            var worker = null;
            var i = 0;
            for (var i in game.gameElements.unit) {
                var unit = game.gameElements.unit[i];
                if (this.isHarvestingOrIdleWorker(unit, playerID)) {
                    worker = unit;
                }
            }
            if (worker == null) { //no idle worker available
                return;
            }
            order.build(game, [worker], building, false);
            return;
        }
    }
};


/**********************************************************
 **********************************************************
 *                      TRAIN UNITS
 **********************************************************
 *********************************************************/


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
 *      Train Soldiers
 */
aiOrders.trainSoldiers = function(game, player, playerID) {
    for (var n in game.gameElements.building) {
        var building = game.gameElements.building[n];
        if (building.o == playerID) {
            if (gameData.ELEMENTS[building.f][building.r][building.t].name == 'Casern') {
                if (building.q.length < 2) { // Don't queue soldiers, it's useless
                    if (player.re[1] < 12) { // Train Bowman
                        order.buy(game, [building.id], gameData.ELEMENTS[gameData.FAMILIES.unit][0][3]);
                    }
                    else { // Train Knight
                        order.buy(game, [building.id], gameData.ELEMENTS[gameData.FAMILIES.unit][0][2]);
                    }
                }
            }
        }
    }
};



/**
 *      More or less evenly haverst Wood and gold
 */
aiOrders.harvest = function(game, player, playerID) {
    var idleWorkers = [];
    for (var n in game.gameElements.unit) {
        var unit = game.gameElements.unit[n];
        if (this.isIdleWorker(unit, playerID)) {
            idleWorkers.push(unit);
        }
    }
    // Gather Gold
    for (var i in idleWorkers) {
        if (player.re[1] < player.re[0] || (player.re[1] < 102 && player.re[0] > 80)) {// Gather Gold
            var nearestHarvestable = tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, 1, null, true);
            if (nearestHarvestable != null) {
                order.gather(game, [idleWorkers[i]], tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, 1, null, true), true);
            }
        }
        else {// Gather Wood
            var nearestHarvestable = tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, 1, null, true);
            if (nearestHarvestable != null) {
                order.gather(game, [idleWorkers[i]], tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, 0, null, true), true);
            }
        }
    }
};



/**********************************************************
 **********************************************************
 *                      UTILS
 **********************************************************
 *********************************************************/


/**
*   Is there something under any part of this element ?
*/
aiOrders.canBeBuiltHere = function (game, position, building) {
    building.p = position;
    var point1 = tools.getPartPosition(building, -1, -1);
    var point2 = {
        x : point1.x + building.shape[0].length ,
        y : point1.y + building.shape.length,
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


/** 
 *  Is the unit an idle worker?
 */
aiOrders.isIdleWorker = function(unit, playerID) {
    if (unit.o == playerID && gameData.ELEMENTS[unit.f][unit.r][unit.t].isBuilder && unit.a == null && unit.pa.length == 0 && (unit.mt == null || unit.mt.x == null)) {
        return true;
    }
    return false;
}


/** 
 *  Is the unit harvesting or an idle worker?
 */
aiOrders.isHarvestingOrIdleWorker = function(unit, playerID) {
    if (unit.o == playerID && gameData.ELEMENTS[unit.f][unit.r][unit.t].isBuilder && (unit.a == null || unit.a.type != 4)) {
        return true;
    }
    return false;
}
