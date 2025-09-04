FROM guidcruncher/typescript-base:node-alsa-latest AS base

ARG DATE=""
ARG VERSION=""
ARG BUILD_CONFIG=prod
ARG DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=development
ARG TARGETARCH
ENV TZ=UTC

RUN <<EOF
apt update
apt install --no-install-recommends -y \
  mpd tzdata sqlite3 caddy build-essential python3 \
  socat memcached libmemcached-tools ffmpeg jq icecast2 procps

apt clean -y > /dev/null
rm -rf /var/cache/apt/archives /var/lib/apt/lists

ln -sf /usr/share/zoneinfo/$TZ /etc/localtime

echo $TZ > /etc/timezone
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
  /build

/usr/bin/npm install -g node-gyp
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

COPY ./container/shared/app/ /app/
COPY ./container/shared/srv/ /srv/
COPY ./container/shared/etc/ /etc/
RUN mkdir -p /srv/etc
COPY ./container/shared/etc/ /srv/etc/
COPY ./container/${BUILD_CONFIG}/app/ /app/
COPY ./container/${BUILD_CONFIG}/srv/ /srv/
COPY ./container/${BUILD_CONFIG}/etc/ /etc/
RUN chmod +x /app/*.sh
RUN /app/update-librespot.sh
RUN chmod +x /srv/librespot/go-librespot
RUN cp /build/packages/client/dist/* /app/packages/client/ -r
RUN cp /build/packages/server/dist/* /app/packages/server/ -r

FROM base AS production
ARG BUILD_CONFIG

COPY --from=build /app/ /app/
COPY --from=build /srv/ /srv/
COPY ./container/shared/etc/ /etc/
COPY ./container/${BUILD_CONFIG}/etc/ /etc/

RUN chown -R appuser:appgroup /app /srv

ENV LIBRESPOT_CONFIG="/srv/config/"
ENV VOPIDY_CONFIG="/srv/config"
ENV VOPIDY_FILES="/srv/files"
ENV VOPIDY_DB="/srv/db"
ENV VOPIDY_DEFAULTS="/srv/defaults"
ENV VOPIDY_SOCKETS="/srv/sockets"
ENV VOPIDY_CACHE="/srv/files/cache"
ENV SPOTIFY_CLIENT_ID=""
ENV SERVER_PORT=3002
ENV IN_DOCKER=true
ENV ALSA_DEFAULT_PCM=vopidy_pipe
ENV ALSA_DEFAULT_CTL=vopidy_pipe
ENV ALSA_CARD="AUDIO"
ENV ALSA_DEVICE="0"
ENV ALSA_CHANNELS="2"
ENV ALSA_MIXERDEVICE=vopidy_pipe
ENV BUILD_DATE=$DATE
ENV BUILD_VERSION=$VERSION

WORKDIR /app
#USER appuser

CMD [ "/app/start.sh" ]

