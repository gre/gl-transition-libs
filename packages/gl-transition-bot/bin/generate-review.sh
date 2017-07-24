#!/bin/bash

#env vars: GITHUB_TOKEN IMGUR_KEY PULL_REQUEST

SCRPTDIR=`dirname $0`
set -e
cd `mktemp -d`
git clone https://github.com/gl-transitions/gl-transitions.git
cd gl-transitions
git fetch origin pull/$PULL_REQUEST/head:pr
git checkout pr
# Xvfb :99 & export DISPLAY=:99
xvfb-run -s "-ac -screen 0 1280x1024x24" node $SCRPTDIR/generate-review.js
