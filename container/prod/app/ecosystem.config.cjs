
module.exports = {
  apps : [
  {
    name   : "memcached",
    cwd    : "/app/packages/server",
    script : "memcached",
    pid_file: "/local/state/memcached.pid",
    args   : "-v -m 64 -u appuser -p 11211 -l 127.0.0.1 -P /local/state/memcached.pid",
  },
  {
    name   : "server",
    cwd    : "/app/packages/server",
    script : "index.js",
    pid_file: "/local/state/server.pid",
    args   : "--color",
  },
  {
    name   : "caddy",
    cwd    : "/usr/bin",
    script : "caddy",
    pid_file: "/local/state/caddy.pid",
    args   : "run --config /local/config/caddy/Caddyfile"
  }
  ]
}
