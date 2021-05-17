#!/bin/sh
node ./node_modules/typescript/bin/tsc --build source $1
node ./postbuild.js
