module.exports = {
  apps : [
  {
    name   : "memcached",
    cwd    : "/app/src/packages/server",
    script : "memcached",
    pid_file: "/srv/pids/memcached.pid",
    args   : "-v -m 64 -u user -p 11211 -l 127.0.0.1 -P /srv/pids/memcached.pid",
  },
  {
    name   : "server",
    cwd    : "/app/src/packages/server",
    script : "npm",
    args   : "run dev",
    pid_file: "/srv/pids/server.pid"
  },
  {
    name   : "ffmpeg",
    cwd    : "/app/src/packages/server",
    script : "/app/capture.sh",
    args   : "",
    pid_file: "/srv/pids/ffmpeg.pid"
  },
  {
    name   : "icecast",
    cwd    : "/app/src/packages/server",
    script : "/usr/bin/icecast2",
    pid_file: "/srv/pids/icecast.pid",
    args   : "-c /app/src/container/shared/srv/defaults/icecast.xml",
  },
  {
    name   : "client",
    cwd    : "/app/src/packages/client",
    script : "npm",
    args   : "run dev",
    pid_file: "/srv/pids/client.pid"
  },
  {
    name   : "librespot",
    cwd    : "/srv/config",
    script : "/app/librespot.sh",
    args   : "--config_dir /srv/config",
    pid_file: "/srv/pids/librespot.pid",
  },
  {
    name   : "mpd",
    cwd    : "/srv/config/",
    script : "/usr/bin/mpd",
    pid_file: "/srv/pids/mpd.pid",
    args   : "--no-daemon --stdout --verbose /app/src/container/shared/srv/defaults/mpd.conf"
  },
  {
    name   : "caddy",
    cwd    : "/usr/bin",
    script : "xcaddy",
    pid_file: "/srv/pids/caddy.pid",
    args   : "run --config /app/src/container/dev/srv/defaults/Caddyfile"
  }
  ]
}
