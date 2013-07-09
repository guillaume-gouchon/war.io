#!/bin/bash
cd ~/warnode;
git pull;
cd ~;

#Minify the data
cd ~/warnode/public/js/game;
./data.sh;

#Minify the engine
./engine.sh;

# Restart server
cd ~/warnode
forever stop app.js;
forever -a -l node.log -o node.log -e node.log start app.js;
