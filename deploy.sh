#!/bin/bash
git checkout . prod;
git pull;

# Update prod version
cd public;
grunt build;

# Restart server
cd ..;
forever stop app.js;
forever -a -l node.log -o node.log -e node.log start app.js;
