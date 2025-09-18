#!/bin/sh
export NODE_ENV=production

mkdir -p \
/local/config/caddy \
/local/config/vopidy \
/srv \
/srv/files \
/srv/files/mixerdesk \
/srv/files/playlists \
/srv/files/cache \
/srv/files/library \
/srv/files/music \
/srv/defaults \
/local/state/vopidy/cache \
/tmp \

icecast="false"

if [ -f "$VOPIDY_CONFIG/vopidy-config.json" ]; then
  icecast="$(cat $VOPIDY_CONFIG/vopidy-config.json | jq '.enableIcecast' -r)"
fi

  if [ "$icecast" == "true" ]; then
    export ENABLE_SERVICES=go-librespot,icecast,capture-audio
  else
    export ENABLE_SERVICES=go-librespot
  fi
