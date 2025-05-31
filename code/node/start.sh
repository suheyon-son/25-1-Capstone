#!/bin/bash
node migrate.js

if [ $? -eq 0 ]; then
  echo "Migration success, starting main.js"
  node main.js
else
  echo "Migration failed, exiting"
  exit 1
fi