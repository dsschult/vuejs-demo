#!/bin/sh
PORT=${2:-8080}
docker run --rm -it -v $PWD/nginx.conf:/etc/nginx/conf.d/nginx.conf:ro -v $PWD/$1:/usr/share/nginx/html:ro -p ${PORT}:8080 nginx
