#!/bin/bash

#env vars: GITHUB_TOKEN IMGUR_KEY PULL_REQUEST

set -e
rm -rf gl-transitions
git clone https://github.com/gl-transitions/gl-transitions.git
cd gl-transitions
git fetch origin pull/$PULL_REQUEST/head:pr
git checkout pr
# Xvfb :99 & export DISPLAY=:99
xvfb-run -s "-ac -screen 0 1280x1024x24" gl-transition-bot-review-pr
