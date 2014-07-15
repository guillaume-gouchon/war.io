#!/bin/bash
git checkout .;
git pull;

# Update prod version
cd public;
grunt build;

# Restart server
cd ..;
sudo forever stop warnode;
forever --uid "warnode" -a -l node.log -o node.log -e node.log start warnode.js;
