#!/bin/bash

export DATE=$(date +'%s')
export VERSION=$(cat ./packages/server/package.json | jq .version -r)

jq -n --arg buildDate "$DATE" --arg version "$VERSION" '{"version": $ARGS.named["version"], "buildDate": $ARGS.named["buildDate"]}' > ./packages/client/src/version.json

