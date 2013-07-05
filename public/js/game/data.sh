#!/bin/bash
./compressJS node/rts/public/js/game/data/*.js node/rts/public/js/game/data/armies/tomatoes/units.js node/rts/public/js/game/data/armies/tomatoes/buildings.js node/rts/public/js/game/data/armies/lemons/units.js node/rts/public/js/game/data/armies/lemons/buildings.js node/rts/public/js/game/data/armies/*.js node/rts/public/js/game/data/map/*.js 
mv min.js data.js

