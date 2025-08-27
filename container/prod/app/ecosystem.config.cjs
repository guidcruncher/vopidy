
module.exports = {
  apps : [
  {
    name   : "memcached",
    cwd    : "/app/packages/server",
    script : "memcached",
    pid_file: "/srv/pids/memcached.pid",
    args   : "-v -m 64 -u user -p 11211 -l 127.0.0.1 -P /srv/pids/memcached.pid",
  },
  {
    name   : "server",
    cwd    : "/app/packages/server",
    script : "index.js",
    pid_file: "/srv/pids/server.pid",
    args   : "--color",
  },
  {
    name   : "ffmpeg",
    cwd    : "/app/packages/server",
    script : "/app/capture.sh",
    pid_file: "/srv/pids/ffmpeg.pid",
    args   : "",
  },
  {
    name   : "icecast",
    cwd    : "/app/packages/server",
    script : "/usr/bin/icecast2",
    pid_file: "/srv/pids/icecast.pid",
    args   : "-c /srv/config/icecast.xml",
  },
  {
    name   : "librespot",
    cwd    : "/srv/librespot",
    script : "/app/librespot.sh",
    pid_file: "/srv/pids/librespot.pid",
    args   : "--config_dir /srv/config"
  },
  {
    name   : "mpd",
    cwd    : "/usr/bin/",
    script : "/usr/bin/mpd",
    pid_file: "/srv/pids/mpd.pid",
    args   : "--no-daemon -v  /srv/config/mpd.conf"
  },
  {
    name   : "caddy",
    cwd    : "/usr/bin",
    script : "caddy",
    pid_file: "/srv/pids/caddy.pid",
    args   : "run --config /srv/defaults/Caddyfile"
  }
  ]
}
