module.exports = {
  {
    name   : "server",
    cwd    : "/app/src/packages/server",
    script : "npm",
    args   : "run dev",
    pid_file: "/run/server/pid"
  },
  {
    name   : "client",
    cwd    : "/app/src/packages/client",
    script : "npm",
    args   : "run dev",
    pid_file: "/run/client/pid"
  },
  {
    name   : "caddy",
    cwd    : "/usr/bin",
    script : "caddy",
    pid_file: "/run/caddy/pid",
    args   : "run --config /app/Caddyfile"
  }
  ]
}
