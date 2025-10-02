FROM guidcruncher/node-pipewire:alpin3-latest AS base

ARG DATE=""
ARG VERSION=""
ARG BUILD_CONFIG=prod
ARG DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ARG TARGETARCH
ENV TZ=UTC
ENV GOLIBRESPOT_AUTHMODE=spotify_token

RUN <<EOF
apk add --no-cache sqlite caddy memcached 

mkdir -p \
  /srv /local/state/vopidy/cache \
  /local/config/vopidy \
  /srv/files \
  /srv/files/mixerdesk \
  /srv/files/playlists \
  /srv/files/cache \
  /srv/files/library \
  /srv/files/music \
  /srv/defaults \
  /app/packages/client \
  /app/packages/server \
  /tmp \
  /app/src

/usr/bin/npm install -g pm2 node-gyp
EOF

FROM base AS build

ARG BUILD_CONFIG
ARG DATE 
ARG VERSION

RUN mkdir -p /build/client/src /build/server/src /build/server/dist
COPY package.json /build/package.json

WORKDIR /build
COPY . .
RUN /usr/bin/npm i --no-audit --no-fund

WORKDIR /build/packages/client
RUN /usr/bin/npm i --no-audit --no-fund
RUN /usr/bin/npm run build-production

WORKDIR /build/packages/server
RUN /usr/bin/npm i --no-audit --no-fund
RUN /usr/bin/npm run build-production
RUN cp package.json /build/packages/server/dist/

WORKDIR /build/packages/server/dist/
RUN /usr/bin/npm i --no-audit --no-fund --omit=dev

RUN cp /build/packages/client/dist/* /app/packages/client/ -r
RUN cp /build/packages/server/dist/* /app/packages/server/ -r

FROM base AS runtime

ARG BUILD_CONFIG
ARG DATE=""
ARG VERSION=""

COPY --from=build /app/ ${APP_BASE}
COPY --from=build /srv/ /srv/

COPY ./container/shaed/srv/ /srv/
COPY ./container/shared/app/ ${APP_BASE}
COPY ./container/${BUILD_CONFIG}/app/ ${APP_BASE}
COPY ./container/${BUILD_CONFIG}/srv/ /srv/
RUN chmod +x /app/*.s
RUN mv /srv/defaults/Caddyfile /local/config/caddy

WORKDIR ${APP_BASE}

ENV MACHINE_NAME="Vopidy"
ENV VOPIDY_CONFIG="/local/config/vopidy"
ENV LIBRESPOT_CONFIG=/local/config/go-librespot
ENV VOPIDY_FILES="/srv/files"
ENV VOPIDY_DB="/local/state/vopidy"
ENV VOPIDY_DEFAULTS="/srv/defaults"
ENV VOPIDY_CACHE="/local/state/vopidy/cache"
ENV SPOTIFY_CLIENT_ID=""
ENV SERVER_PORT=3002

ENV IN_DOCKER=true
ENV BUILD_DATE=$DATE
ENV BUILD_VERSION=$VERSION
ENV SHOW_REQUEST_TIMINGS=false
ENV BASE_PATH="http://192.168.1.201:3004"
ENV MACHINENAME="Vopidy Server"
ENV SNAPSERVER_CODEC=flac
ENV SNAPSERVER_CHUNK_MS=26
ENV SNAPSERVER_BUFFER=1000
ENV SNAPSERVER_SOURCE=pipe:///tmp/snapfifo?name=Vopidy&sampleformat=$SNAPSERVER_SAMPLEFORMAT&codec=$SNAPSERVER_CODEC
ENV SNAPCLIENT_HOSTID=Vopidy-Local
ENV SNAPSERVER_DATADIR="$VOPIDY_CONFIG/snapserver"
ENV SPOTIFY_API="https://api.spotify.com/v1"

ENTRYPOINT [ "/usr/local/bin/entrypoint.sh", "/app/start.sh" ]

