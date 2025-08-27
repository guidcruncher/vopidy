#!/bin/bash
export NODE_ENV=production
export LOOPBACK_SUPPORT=false
modprop=$(modinfo -F name snd-aloop)

if [ "$modprop" == "snd_aloop" ]; then
  export LOOPBACK_SUPPORT=true
  cp /srv/etc/asound-noloopback.conf /etc/asound.conf
else
  cp /srv/etc/asound.conf /etc/asound.conf
fi

mkdir -p \
/srv \
/srv/pids \
/srv/config \
/srv/logs \
/srv/sockets \
/srv/librespot \
/srv/files \
/srv/files/mixerdesk \
/srv/files/playlists \
/srv/files/cache \
/srv/files/library \
/srv/files/music \
/srv/defaults \
/srv/db \
/app/packages/client \
/app/packages/server \
/tmp \
/app/src


# /app/alsa-capabilities.sh -s -j | jq > "$VOPIDY_CONFIG"/soundhw.json

if [ -f "/run/secrets/spotify-credentials" ]; then
  export $(xargs </run/secrets/spotify-credentials)
fi

if [ -f "/run/secrets/pm2-credentials" ]; then
  export $(xargs </run/secrets/pm2-credentials)
  if [ -n "$PM2_PUBLIC_KEY" ]; then
    pm2 link "$PM2_PUBLIC_KEY" "$PM2_SECRET_KEY" 
  fi
fi

if [ ! -f "$VOPIDY_CONFIG/config.yml" ]; then
  cp "$VOPIDY_DEFAULTS/config.yml" "$VOPIDY_CONFIG/config.yml"
fi

if [ ! -f "$VOPIDY_CONFIG/icecast.xml" ]; then
  cp "$VOPIDY_DEFAULTS/icecast.xml" "$VOPIDY_CONFIG/icecast.xml"
fi

cp "$VOPIDY_DEFAULTS/mpd.conf" "$VOPIDY_CONFIG/mpd.conf"
 
if [ ! -f "$VOPIDY_DB/vopidy.sqlite" ]; then
  sqlite3 "$VOPIDY_DB/vopidy.sqlite"  < "$VOPIDY_DEFAULTS/schema.sql"
fi

icecast="true"
memcached="true"

if [ -f "$VOPIDY_CONFIG/vopidy-config.json" ]; then
  bitperfect="$(cat $VOPIDY_CONFIG/vopidy-config.json | jq '.enableBitPerfectPlayback' -r)"

  if [ "$bitperfect" == "true" ]; then
    cp "$VOPIDY_DEFAULTS"/mpd-bitperfect.conf "$VOPIDY_CONFIG"/mpd.conf
    cp "$VOPIDY_DEFAULTS"/config-bitperfect.yml "$VOPIDY_CONFIG"/config.yml
  else
    cp "$VOPIDY_DEFAULTS"/mpd.conf "$VOPIDY_CONFIG"/mpd.conf
    cp "$VOPIDY_DEFAULTS"/config.yml "$VOPIDY_CONFIG"/config.yml
  fi

  icecast="$(cat $VOPIDY_CONFIG/vopidy-config.json | jq '.enableIcecast' -r)"
  memcached="$(cat $VOPIDY_CONFIG/vopidy-config.json | jq '.enableRequestCache' -r)"
fi

cd /app/

services="caddy,librespot,mpd,server"

if [ "$icecast" == "true" ] && [ "$LOOPBACK_SUPPORT" == "true" ]; then
  services="$services,ffmpeg,icecast"
else
  if [ "$icecast" == "true" ]; then
  echo "***************************************"
  echo "** Icecast wants to be enabled but   **"
  echo "** your kernel does not have         **"
  echo "** snd-aloop enabled. Enable on host **"
  echo "** and reboot, otherwise disable     **"
  echo "** Icecast in config.                **"
  echo "***************************************"
  fi
fi

if [ "$memcached" == "true" ]; then
  services="$services,memcached"
fi

pm2 start /app/ecosystem.config.cjs --only "$services"

pm2 logs

tail -f /dev/null
