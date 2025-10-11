#!/bin/bash
enableeq=""

if [ -f "$VOPIDY_CONFIG/vopidy-config.json" ]; then
  emableeq="$(cat $VOPIDY_CONFIG/vopidy-config.json | jq '.enableEqualiser' -r)"
fi

  if [ "$enableeq" != "" ]; then
    export USE_PIPEWIRE_EQ="$enableeq"

  fi
