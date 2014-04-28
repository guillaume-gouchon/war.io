#!/bin/bash
git checkout . prod;
git pull;

# Update prod version
cd public;
grunt build;

# Restart server
cd ..;
sudo forever stop warnode;
forever --uuid warnode -a -l node.log -o node.log -e node.log start warnode.js;
