
module.exports = {
  apps : [
  {
    name   : "server",
    cwd    : "/app/packages/server",
    script : "index.js",
    pid_file: "/run/pid/server.pid",
    args   : "--color",
  },
  {
    name   : "caddy",
    cwd    : "/usr/bin",
    script : "caddy",
    pid_file: "/run/pid/caddy.pid",
    args   : "run --config /app/Caddyfile"
  }
  ]
}
