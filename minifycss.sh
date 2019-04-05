#!/bin/sh

mkdir -p dist
cat css/*.css | postcss >dist/main.css


