FROM guidcruncher/node-pipewire:latest AS base

ARG DATE=""
ARG VERSION=""
ARG BUILD_CONFIG=prod
ARG DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=development
ARG TARGETARCH
ENV TZ=UTC
ENV GOLIBRESPOT_CREDENTIAL_TYPE=spotify_token
ENV SPOTIFY_AUTHJSON=/local/state/vopidy/.vopidy-auth.json

RUN <<EOF
apk add --no-cache sqlite caddy memcached 

mkdir -p \
  /srv \
  /local/state/vopidy/cache \
  /local/config/vopidy \
  /local/config/caddy \
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

node
/usr/bin/npm install -g pm2 node-gyp
EOF

COPY ./container/config.yml /local/config/go-librespot/config.yml
COPY ./container/shared/srv/ /srv/
COPY ./container/${BUILD_CONFIG}/app/ /app/
RUN chmod +x /app/*.sh
RUN mv /srv/defaults/Caddyfile /local/config/caddy

FROM base As build

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

COPY --from=build /app/ /app/
COPY --from=build /srv/ /srv/


ENV VOPIDY_CONFIG="/local/config/vopidy"
ENV LIBRESPOT_CONFIG=/local/config/go-librespot
ENV VOPIDY_FILES="/srv/files"
ENV VOPIDY_DB="/local/state/vopidy"
ENV VOPIDY_DEFAULTS="/srv/defaults"
ENV VOPIDY_CACHE="/local/state/vopidy/cache"
ENV SPOTIFY_CLIENT_ID=""
ENV SERVER_PORT=3002
ENV TZ=UTC
ENV GOLIBRESPOT_CREDENTIAL_TYPE=spotify_token
ENV SPOTIFY_AUTHJSON=/local/state/vopidy/.vopidy-auth.json
ENV IN_DOCKER=true
ENV BUILD_DATE=$DATE
ENV BUILD_VERSION=$VERSION

WORKDIR /app

ENTRYPOINT [ "/usr/local/bin/entrypoint.sh", "/app/start.sh" ]

