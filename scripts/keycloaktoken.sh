#!/bin/bash

set -e

http --form POST \
    https://auth.trebler.dev/auth/realms/messenger/protocol/openid-connect/token \
    username="$1" \
    password="$2" \
    grant_type=password \
    client_id=messenger
