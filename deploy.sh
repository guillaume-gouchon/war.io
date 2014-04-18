#!/bin/bash
git checkout . prod;
git pull;

# Update prod version
cd public;
grunt build;

# Restart server
cd ..;
forever stop warnode.js;
forever -a -l node.log -o node.log -e node.log start warnode.js;
