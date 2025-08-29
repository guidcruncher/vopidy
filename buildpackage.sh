#!/bin/bash

npm run build

git add --all

export DATE=$(date +'%s')
export VERSION=$(cat ./packages/server/package.json | jq .version -r)

jq -n --arg buildDate "$DATE" --arg version "$VERSION" '{"version": $ARGS.named["version"], "buildDate": $ARGS.named["buildDate"]}' > ./packages/client/src/version.json

git commit -m "$VERSION"
git tag "$VERSION"
git push
git push --tags
git push origin dev:main -f
git status
docker buildx build --build-arg VERSION="$VERSION" --build-arg DATE="$DATE" . -f ./container/Dockerfile -t guidcruncher/vopidy:latest -t guidcruncher/vopidy:"$VERSION" --pull --push
