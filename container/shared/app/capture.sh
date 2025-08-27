#/bin/bash
input="alsa"
device="hw:0,1"
channels=2
samplerate=48000
format="ogg"
contenttype="audio/ogg"
codec="flac"
level=5


/usr/bin/ffmpeg -f "$input" \
         -i "$device" \
         -ar "$samplerate" \
         -ac "$channels" \
         -c:a "$codec" \
         -compression_level "$level" \
         -f "$format" \
         -content_type "$contenttype" \
         icecast://source:pass@localhost:8000/vopidy-stream

sleep 1
