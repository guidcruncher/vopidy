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

if [ -f "/run/secrets/spotify-credentials" ]; then
  export $(xargs </run/secrets/spotify-credentials)
fi
 
if [ ! -f "$VOPIDY_DB/vopidy.sqlite" ]; then
  sh /srv/db/update-db.sh
fi

cd /app/src

pm2 start /app/ecosystem.config.cjs

pm2 logs

tail -f /dev/null
