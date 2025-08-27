#!/bin/bash
SPOTIFY_USERNAME=""
SPOTIFY_TOKEN=""

if [ -f "/srv/db/.vopidy-auth.json" ]; then
  SPOTIFY_USERNAME="$(cat /srv/db/.vopidy-auth.json | jq .profile.display_name -r)"
  SPOTIFY_TOKEN="$(cat /srv/db/.vopidy-auth.json | jq .auth.access_token -r)"
fi

filename="$VOPIDY_DEFAULTS/config.yml"

if [ -f "$VOPIDY_CONFIG/vopidy-config.json" ]; then
bitperfect="$(cat $VOPIDY_CONFIG/vopidy-config.json | jq '.enableBitPerfectPlayback' -r)"

if [ "$bitperfect" == "true" ]; then
filename="$VOPIDY_DEFAULTS"/config-bitperfect.yml
fi
fi

cat "$filename" | sed "s/{SPOTIFY_USERNAME}/$SPOTIFY_USERNAME/g" | \
   sed "s/{SPOTIFY_TOKEN}/$SPOTIFY_TOKEN/g" \
   > "$VOPIDY_CONFIG"/config.yml

if [ -f "$VOPIDY_CONFIG/lockfile" ]; then
  rm "$VOPIDY_CONFIG/lockfile"
fi

/srv/librespot/go-librespot --config_dir "$VOPIDY_CONFIG"  &

pgrep go-librespot > /srv/pids/librespot.pid

tail -f /dev/null
