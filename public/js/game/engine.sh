#!/bin/bash
./compressJS node/rts/public/js/game/engine/*.js node/rts/public/js/game/engine/class/*.js
mv min.js engine.js
