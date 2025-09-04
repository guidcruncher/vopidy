module.exports = {
  apps : [
  {
    name   : "memcached",
    cwd    : "/app/src/packages/server",
    script : "memcached",
    pid_file: "/local/state/memcached.pid",
    args   : "-v -m 64 -u user -p 11211 -l 127.0.0.1 -P /local/state/memcached.pid",
  },
  {
    name   : "server",
    cwd    : "/app/src/packages/server",
    script : "npm",
    args   : "run dev",
    pid_file: "/local/state/server.pid"
  },
  {
    name   : "client",
    cwd    : "/app/src/packages/client",
    script : "npm",
    args   : "run dev",
    pid_file: "/local/state/client.pid"
  },
  {
    name   : "caddy",
    cwd    : "/usr/bin",
    script : "xcaddy",
    pid_file: "/local/state/caddy.pid",
    args   : "run --config /local/config/caddy/Caddyfile"
  }
  ]
}
