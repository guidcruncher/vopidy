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
/app/packages/client \
/app/packages/server \
/tmp \
/app/src

cp -r /app/src/container/shared/app/* /app/
cp -r /app/src/container/shared/srv/* /srv/
cp -r /app/src/container/dev/app/* /app/
cp -r /app/src/container/dev/srv/* /srv/

if [ -f "/run/secrets/spotify-credentials" ]; then
  export $(xargs </run/secrets/spotify-credentials)
fi
 
if [ ! -f "$VOPIDY_DB/vopidy.sqlite" ]; then
  sh /srv/db/update-db.sh
fi

icecast="false"
memcached="true"

if [ -f "$VOPIDY_CONFIG/vopidy-config.json" ]; then
  bitperfect="$(cat $VOPIDY_CONFIG/vopidy-config.json | jq '.enableBitPerfectPlayback' -r)"

  icecast="$(cat $VOPIDY_CONFIG/vopidy-config.json | jq '.enableIcecast' -r)"
  memcached="$(cat $VOPIDY_CONFIG/vopidy-config.json | jq '.enableRequestCache' -r)"

fi

  if [ "$icecast" == "true" ]; then
    pm2base.sh start icecast capture-audio
  else
    pm2base.sh stop icecast capture-audio
    kill $(pgrep -f ffmpeg)
    kill $(pgrep -f icecast)
  fi

cd /app/src

services="client,server"

if [ "$memcached" == "true" ]; then
  services="$services,memcached"
fi

pm2 start /app/ecosystem.config.cjs --only "$services"

pm2 logs

tail -f /dev/null
