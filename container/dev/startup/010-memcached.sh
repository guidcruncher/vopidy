#!/bin/bash

memcached -v -m 64 -u appuser -p 11211 -l 127.0.0.1 \
    -P /run/memcached/pid -d
