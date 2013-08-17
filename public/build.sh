#!/bin/sh

# create sprites 
lib/smartsprites/smartsprites.sh --root-dir-path ../

# compress .css
cat css/bootstrap.min.css css/style-sprite.css css/gui-sprite.css > css/style.min.css
java -jar lib/yuicompressor-2.4.2.jar -v -o css/style.min.css css/style.min.css

# compress client .js
cat js/game/client/socketManager.js js/game/client/utils.js js/game/client/gameContent.js js/game/client/gameSurface.js js/game/client/drawingTools.js js/game/client/GUI.js js/game/client/gameManager.js js/game/client/soundManager.js js/game/client/controls.js js/game/client/userInput.js img/3D/water.js > js/game/client.js
java -jar lib/yuicompressor-2.4.2.jar -v -o js/game/client.js js/game/client.js

# compress data .js
cat js/game/data/*.js js/game/data/armies/tomatoes/researches.js js/game/data/armies/tomatoes/units.js js/game/data/armies/tomatoes/buildings.js js/game/data/armies/lemons/researches.js js/game/data/armies/lemons/units.js js/game/data/armies/lemons/buildings.js js/game/data/armies/*.js js/game/data/map/*.js > js/game/data.js
java -jar lib/yuicompressor-2.4.2.jar -v -o js/game/data.js js/game/data.js 

# compress engine .js
cat js/game/engine/*.js js/game/engine/class/*.js > js/game/engine.js
java -jar lib/yuicompressor-2.4.2.jar -v -o js/game/engine.js js/game/engine.js
