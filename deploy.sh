#!/bin/bash
cd ~/warnode;
git pull;
cd ~;

#Minify the client
rm warnode/public/js/game/client.js;
./compressJS warnode/public/js/game/client/gameSurface.js warnode/public/js/game/client/drawingTools.js  warnode/public/js/game/client/GUI.js warnode/public/js/game/client/soundManager.js warnode/public/js/game/client/gameManager.js  warnode/public/js/game/client/gameContent.js warnode/public/js/game/client/utils.js warnode/public/js/game/client/input/*.js;
mv min.js warnode/public/js/game/client.js;

#Minify the engine
rm warnode/public/js/game/engine.js;
./compressJS warnode/public/js/game/engine/*.js warnode/public/js/game/engine/class/*.js;
mv min.js warnode/public/js/game/engine.js;

# Restart server
cd ~/warnode
forever stop app.js;
forever -a -l node.log -o node.log -e node.log start app.js;
