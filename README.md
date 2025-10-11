# Vopidy

A nicer and friendlier Mopidy Music server clone in NodeJS, Vue and Typescript.

To run in development mode(Docker required)

```bash
mkdir ./vopidy
cd ./vopidy
git clone https://github.com/guidcruncher/vopidy.git .
npm run start-dev-build
```

It should be accessible on http://localhost:3004 with Icecast on http://localhost:8000

## Example Docker compose

```yaml
services:
  vopidy:
    image: guidcruncher/vopidy:latest
    extra_hosts:
      - vopidy:127.0.0.1
    secrets:
      - spotify-credentials
    networks:
      - proxy
    dns:
      - 1.1.1.1
      - 8.8.8.8
    ports:
      - 3004:3004
      - 8000:8000
    environment:
      - ICECAST_BITRATE=48000
      - ICECAST_CHANNELS=2
      - ICECAST_COMPLEVEL=5
      - ICECAST_ENABLE=true
      - ICECAST_SAMPLERATE=48000
      - TZ=UTC
      - BASE_PATH=http://192.168.1.201:3004
      - SHOW_REQUEST_TIMINGS=false
    container_name: vopidy
    hostname: vopidy
    restart: unless-stopped
    volumes:
      - ./config:/local/config/vopidy
      - ./db:/local/state/vopidy
      - ./files:/srv/files
      - type: tmpfs
        target: /tmp
        tmpfs:
          mode: 0o01777
    devices:
      - /dev/snd:/dev/snd:rw
    privileged: true
    cap_add:
      - SYS_NICE
      - CAP_IPC_LOCK
      - CAP_NET_ADMIN
      - SYS_RAWIO

networks:
  proxy:
    external: true

secrets:
  spotify-credentials:
    file: spotifycredentials
```

## Encironment vwriables

| Name                        | Readonly | Default  | Description                                                                     |
|-----------------------------|----------|----------|---------------------------------------------------------------------------------|
| ICECAST_BITRATE             | No       | 48000    | Icecast bitrate                                                                 |
| ICECAST_CHANNELS            | No       | 2        | Icecast channels                                                                |
| ICECAST_COMPLEVEL           | No       | 5        | Icecast compression level (1-10)                                                |
| ICECAST_ENABLE              | No       | true     | Enable Icecast                                                                  |
| ICECAST_SAMPLERATE          | No       | 48000    | Icecast sample rate                                                             |
| TZ                          | No       | UTC      | Timezone                                                                        |
| BASE_PATH                   | No       |          | The base path of the application (eg: http://192.168.1.201:3004)                |
| SHOW_REQUEST_TIMINGS        | No       | false    | Enables detailed trace logs showing every request and its duration              |
