#!/bin/sh

TAG=docker.europa.area51.dev/area51/departureboards:latest
docker build \
    -t ${TAG} \
    --build-arg prefix=docker.europa.area51.dev/library/ \
    --build-arg aptrepo=https://nexus.europa.area51.dev/repository/apt- \
    --add-host nexus.europa.area51.dev:192.168.2.4 \
    --build-arg npmrepo=https://nexus.europa.area51.dev/repository/npm-group/ \
    . &&\
docker run -i --rm -p 9080:80 ${TAG}

