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

cast="false"

if [ -f "$VOPIDY_CONFIG/vopidy-config.json" ]; then
  cast="$(cat $VOPIDY_CONFIG/vopidy-config.json | jq '.enableCast' -r)"
fi

  if [ "$cast" == "true" ]; then
    export ENABLE_SERVICES=go-librespot,snapserver
  else
    export ENABLE_SERVICES=go-librespot
  fi
