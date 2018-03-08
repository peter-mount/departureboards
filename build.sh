#!/bin/bash

docker build -t test . &&\
docker run -i --rm -p 9080:80 test

