#/bin/bash
input="alsa"
card="$(aplay -l | grep Loopback | grep card |  cut -d ' ' -f2 | sed 's/://' | head -n 1)"
device="hw:$card,1"
channels=2
samplerate=48000
format="ogg"
contenttype="audio/ogg"
codec="flac"
level=8
bitrate="128000" 

/usr/bin/ffmpeg -f "$input" \
         -i "$device" \
         -ar "$samplerate" \
         -ac "$channels" \
         -b:a "$bitrate" \
         -c:a "$codec" \
         -compression_level "$level" \
         -f "$format" \
         -content_type "$contenttype" \
         icecast://source:pass@localhost:8000/vopidy-stream

sleep 1
