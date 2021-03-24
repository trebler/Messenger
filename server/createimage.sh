#!/bin/bash

set -e

usage() {
    echo "Usage: $0 [-r {DOCKER_REGISTRY}] [-t {DOCKER_IMAGE_TAG}]" 1>&2
    exit 1
}

while getopts ":r:pi:t:h:" opt; do
    case ${opt} in
    r)
        DOCKER_REGISTRY=$OPTARG
        ;;
    t)
        TAG=$OPTARG
        ;;
    h | [?])
        usage
        exit
        ;;
    esac
done
shift $((OPTIND - 1))

GIT_VERSION=$(git describe --long --dirty --always --tags)

BRANCH=$(git branch --show-current)

if [ -z "$DOCKER_REGISTRY" ]; then
    DOCKER_REGISTRY="trebler"
fi

IMAGE_NAME=messengerserver

docker build . \
    --tag=$DOCKER_REGISTRY/$IMAGE_NAME:"$GIT_VERSION" \
    --tag=$DOCKER_REGISTRY/$IMAGE_NAME:latest

if [ -n "$TAG" ]; then
    docker tag $DOCKER_REGISTRY/$IMAGE_NAME:latest $DOCKER_REGISTRY/$IMAGE_NAME:"$TAG"
    docker push $DOCKER_REGISTRY/$IMAGE_NAME:"$TAG"
fi

docker push $DOCKER_REGISTRY/$IMAGE_NAME:"$GIT_VERSION"
docker push $DOCKER_REGISTRY/$IMAGE_NAME:latest

if [ -n "$BRANCH" ]; then
    docker tag $DOCKER_REGISTRY/$IMAGE_NAME:latest $DOCKER_REGISTRY/$IMAGE_NAME:"$BRANCH"
    docker push $DOCKER_REGISTRY/$IMAGE_NAME:"$BRANCH"
fi
