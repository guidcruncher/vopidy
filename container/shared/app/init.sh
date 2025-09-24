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

cast="true"
codec="flac"

if [ -f "$VOPIDY_CONFIG/vopidy-config.json" ]; then
  #cast="$(cat $VOPIDY_CONFIG/vopidy-config.json | jq '.enableCast' -r)"
  codec="$(cat $VOPIDY_CONFIG/vopidy-config.json | jq '.snapcastCodec' -r)"
fi

export SNAPSERVER_CODEC="$codec"

if [ "$SNAPSERVER_CODEC" == 'flac' ]; then
  export SNAPSERVER_CHUNK_MS=26
  export SNAPSERVER_BUFFER=1000
else
  export SNAPSERVER_CHUNK_MS=20
  export SNAPSERVER_BUFFER=1000
fi

  if [ "$cast" == "true" ]; then
    export ENABLE_SERVICES=go-librespot,snapserver,snapclient
  else
    export ENABLE_SERVICES=go-librespot
  fi

envsubst < /local/.envbase >/local/.env
