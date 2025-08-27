#!/bin/bash
basedir=$(pwd)
mkdir -p ./tmp/librespot
cd ./tmp/librespot

if [ -z "$TARGETARCH" ]; then
  TARGETARCH="$(uname -m)"
fi

ARCH="$TARGETARCH"

if [ "$TARGETARCH" = "aarch64" ]; then
  ARCH="arm64"
fi

echo "Looking for go-librespot_linux_$ARCH.tar.gz"

DOWNLOAD_URL=$(curl -s \
  https://api.github.com/repos/devgianlu/go-librespot/releases/latest | \
  jq '.assets[].browser_download_url' -r | \
  grep "go-librespot_linux_$ARCH.tar.gz" \
  )

if [ -z "$DOWNLOAD_URL" ]; then
  echo "Unable to determine download url for arch $ARCH"
  exit 1
else
  echo "Downloading from $DOWNLOAD_URL"
  curl -s -L "$DOWNLOAD_URL" -o ./librespot.tar.gz 2>/dev/null

    if [ -f "./librespot.tar.gz" ]; then
      tar xvf ./librespot.tar.gz go-librespot
      chmod +x go-librespot
      rm ./librespot.tar.gz
      mv ./go-librespot /srv/librespot/
      chmod +x /srv/librespot/go-librespot
    else
      echo "An error occured, download file not found."
      cd "$basedir"
      rm -rf ./tmp
      exit 1
    fi
fi

cd "$basedir"
rm -rf ./tmp
