var aiOrders = {};

/**
 *      Updates the orders that the AI gives to its units
 */
aiOrders.update = function(game, player) {
    var playerID = player.o;
    this.buildHouses(game, player, playerID);
    this.harvest(game, player, playerID);
    this.trainHarvesters(game, playerID);
    this.trainSoldiers(game, player, playerID);
    // count buildings
    var doIHaveATownHall = false;
    var nbCaserns = 0
    for (var i in game.buildings) {
        var building = game.buildings[i];
        if (building.o == player.o) {
            if (building.t == gameData.ELEMENTS[gameData.FAMILIES.building][player.r].hq.t) {
                doIHaveATownHall = true;
            } else if (building.t == gameData.ELEMENTS[gameData.FAMILIES.building][player.r].casern.t) {
                nbCaserns++;
            }
        }
    }
    this.buildRax(game, player, playerID, nbCaserns);
    this.finishBuildings(game, playerID);
    this.buildTownHall(game, player, playerID, doIHaveATownHall);
    this.shoudIAttack(game, playerID);
};


/**********************************************************
 **********************************************************
 *                      BUILDINGS
 **********************************************************
 *********************************************************/

/**
 *      Build Rax
 */
aiOrders.buildRax = function(game, player, playerID, nbCaserns) {
    var rax = gameData.ELEMENTS[gameData.FAMILIES.building][player.r].casern;
    if (production.canBuyIt(game.players, playerID, rax)) {
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
            pos = worker.p;
            order.move(game, [worker], parseInt(Math.random() * game.grid[0].length - 1), parseInt(Math.random() * game.grid.length - 1), true);
            var tilesAround = tools.getFreeTilesAroundElements(game, worker);
            for (var n in tilesAround) {
                var neighbors = tools.getNeighbors(game.grid, pos.x, pos.y);
                for (var j in neighbors) {
                    pos = neighbors[j];
                    if (this.canBeBuiltHere(game, pos, rax)) {
                        if (nbCaserns > 0 && Math.random() < 0.5) { // build towers sometimes 
                            order.buildThatHere(game, [worker.id], gameData.ELEMENTS[gameData.FAMILIES.building][player.r].tower, pos.x, pos.y, true); 
                        } else {
                            order.buildThatHere(game, [worker.id], rax, pos.x, pos.y, true);     
                        }
                    }
                }
            }
        }
    }
};


/**
 *      Build Town Hall
 */
aiOrders.buildTownHall = function(game, player, playerID, doIHaveATownHall) {
    var townHall = gameData.ELEMENTS[gameData.FAMILIES.building][player.r].hq;
    if (production.canBuyIt(game.players, playerID, townHall) && (player.pop.current > 20 || !doIHaveATownHall)) {
        var worker = null;
        var n = 0;
        for (var n in game.gameElements.unit) {
            var unit = game.gameElements.unit[n];
            if (this.isHarvestingOrIdleWorker(unit, playerID) || !doIHaveATownHall) {
                worker = unit;
            }
        }
        if (worker == null) { //no idle worker available
            return;
        }
        var pos = worker.p;
        var i = 0;
        for (var i = 0; i < 10; i++) {
            pos = worker.p;
            order.move(game, [worker], parseInt(Math.random() * game.grid[0].length - 1), parseInt(Math.random() * game.grid.length - 1), true);
            var tilesAround = tools.getFreeTilesAroundElements(game, worker);
            for (var n in tilesAround) {
                var neighbors = tools.getNeighbors(game.grid, pos.x, pos.y);
                for (var j in neighbors) {
                    pos = neighbors[j];
                    if (this.canBeBuiltHere(game, pos, townHall)) {
                        order.buildThatHere(game, [worker.id], townHall, pos.x, pos.y, true); 
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
    var house = gameData.ELEMENTS[gameData.FAMILIES.building][player.r].house;
    if (production.canBuyIt(game.players, playerID, house) && player.pop.current > player.pop.max - 3) {
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
                        order.buildThatHere(game, [worker.id], house, pos.x, pos.y, false); 
                        return;
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
        if (building.o == playerID && building.cp < 100) { // building with 1 HP
            var worker = null;
            var i = 0;
            for (var i in game.gameElements.unit) {
                var unit = game.gameElements.unit[i];
                if (this.isIdleWorker(unit, playerID)) {
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
        if (building.o == playerID && building.t == gameData.ELEMENTS[building.f][building.r].hq.t) {
                if (building.q.length < 2) { // Don't queue worker, it's useless
                    order.buy(game, [building.id], gameData.ELEMENTS[gameData.FAMILIES.unit][building.r].builder);
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
        if (building.o == playerID && building.t == gameData.ELEMENTS[gameData.FAMILIES.building][building.r].casern.t) {
            if (building.q.length < 2) { // Don't queue soldiers, it's useless
                if (player.re[1] < 200) { // Train Bowman
                    order.buy(game, [building.id], gameData.ELEMENTS[gameData.FAMILIES.unit][building.r].baseUnit2);
                } else { // Train Swordsman
                    order.buy(game, [building.id], gameData.ELEMENTS[gameData.FAMILIES.unit][building.r].baseUnit1);
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
        if (player.re[0] <= player.re[1] || player.re[0] < 100 && player.re[1] > 80 || player.re[0] < 50) {// Gather Gold
            var nearestHarvestable = tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, gameData.RESOURCES.gold.id, null, true);
            if (nearestHarvestable != null) {
                order.gather(game, [idleWorkers[i]], tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, gameData.RESOURCES.gold.id, null, true), true);
            }
        }
        else {// Gather Wood
            var nearestHarvestable = tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, gameData.RESOURCES.wood.id, null, true);
            if (nearestHarvestable != null) {
                order.gather(game, [idleWorkers[i]], tools.getNearestStuff(game, idleWorkers[i], gameData.FAMILIES.land, gameData.RESOURCES.wood.id, null, true), true);
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
aiOrders.canBeBuiltHere = function (game, pos, building) {
    building.p = pos;
    var point1 = tools.getPartPosition(building, 0, 0);
    var point2 = {
        x : point1.x + building.shape[0].length - 1,
        y : point1.y + building.shape.length - 1
    };
    for (var i = point1.x; i <= point2.x; i++) {
        for (var j = point1.y; j <= point2.y; j++) {
            if (i == 0 || j == 0 || game.grid[i] == null || game.grid[i][j] == null 
                || i == game.grid[0].length - 1 || j == game.grid.length - 1
                || game.grid[i][j].c > 0) {
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
    var unitData = tools.getElementData(unit);
    if (unit.o == playerID && unitData.isBuilder && unit.a == null && unit.pa.length == 0) {
        return true;
    }
    return false;
}


/** 
 *  Is the unit harvesting or an idle worker?
 */
aiOrders.isHarvestingOrIdleWorker = function(unit, playerID) {
    var unitData = tools.getElementData(unit);
    if (unit.o == playerID && unitData.isBuilder && (unit.a == null || unit.a.type == action.ACTION_TYPES.gather)) {
        return true;
    }
    return false;
}


/**     Is there anything that I could attack?
 *
 */
aiOrders.shoudIAttack = function(game, playerID) {
    var soldiers = [];
    var i = 0;
    for (var i in game.gameElements.unit) {
        var unit = game.gameElements.unit[i];
        var unitData = tools.getElementData(unit);
        if (unit.o == playerID && !unitData.isBuilder) {
            soldiers.push(unit);
        }
    }
    if (soldiers.length > 10) { // BANZAIIIIII!
        //First, finish off all units
        for (var n in game.gameElements.unit) {
            var unit = game.gameElements.unit[n];
            var unitData = tools.getElementData(unit);
            if (unit.o != playerID && !unitData.isBuilder) { // First, focus attacking units
                try {
                    order.attack(game, soldiers, unit);
                    return;
                }
                catch(err) {
                    console.log('Attack failed. Error: ' + err);
                }
            }
        }

        for (var n in game.gameElements.unit) {
            var unit = game.gameElements.unit[n];
            var unitData = tools.getElementData(unit);
            if (unit.o != playerID && !unitData.isBuilder) { // Then, focus the builders
                try {
                    order.attack(game, soldiers, unit);
                    return;
                }
                catch(err) {
                    console.log('Attack failed. Error: ' + err);
                }
            }
        }

        // Then the buildings
        for (var n in game.gameElements.building) {
            var building = game.gameElements.building[n];
            if (building.o != playerID) { // You'll die first
                try {
                    order.attack(game, soldiers, building);
                    return;
                }
                catch(err) {
                    console.log('Attack failed. Error: ' + err);
                }
            }
        }
    }
};

