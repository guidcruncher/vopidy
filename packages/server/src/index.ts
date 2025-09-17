import { AppEnv } from "@/core/appenv"
import { Config, ConfigWriter } from "@/core/config"
import { logger } from "@/core/logger"
import { ProcessLauncher } from "@/core/processlauncher"
import { loadScheduler } from "@/core/scheduler"
import { auth } from "@/routes/auth"
import { httprpc, setupWebsocket } from "@/routes/jsonrpc"
import { OpenApiDoc } from "@/routes/openapidoc"
import { proxyRoute } from "@/routes/proxy"
import { serve } from "@hono/node-server"
import { swaggerUI } from "@hono/swagger-ui"
import * as crypto from "crypto"
import { Hono } from "hono"
import { contextStorage } from "hono/context-storage"
import { cors } from "hono/cors"
import { prettyJSON } from "hono/pretty-json"

import * as fs from "fs"
import * as path from "path"

process.on("uncaughtException", (err, origin) => {
  logger.error(`Caught exception: ${err}\n` + `Exception origin: ${origin}\n`)
})

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
})

ProcessLauncher.start()
const cfg = Config.load()
ConfigWriter(cfg)

const app = new Hono<AppEnv>()

app.use(contextStorage())

app.use(async (c, next) => {
  const reqId = c.req.header("X-Request-ID") ?? crypto.randomBytes(8).toString("hex")
  c.set("RequestID", reqId)
  const start = Date.now()
  if ((process.env.SHOW_REQUEST_TIMINGS ?? "true").toString() == "true") {
    logger.trace(`Begin`)
    logger.trace(`URL: ${c.req.path}`)
  }

  await next()
  const end = Date.now()

  if ((process.env.SHOW_REQUEST_TIMINGS ?? "true").toString() == "true") {
    logger.trace(`End in ${end - start}ms`)
  }

  c.res.headers.set("X-Response-Time", `${end - start}`)
  c.res.headers.set("X-Request-ID", reqId)
})

app.use("*", prettyJSON({ space: 2 }))
app.use(
  "*",
  cors({
    origin: "*", // Specify allowed origins (update for production)
    allowMethods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    credentials: true,
    maxAge: 86400, // Cache preflight for 1 day
  }),
)

app.notFound((c) => c.json({ status: 404, statusText: "Not Found", ok: false }, 404))

app.use("/files/*", async (c, next) => {
  let filename = path.join("/srv", c.req.path)
  if (fs.existsSync(filename)) {
    const contenttype = ""
    const bytes = fs.readFileSync(filename)
    return c.body(bytes, {
      headers: { "Content-Type": contenttype },
    })
  }

  return c.notFound()
})

// OpenAPI Documentation setup
app.get("/doc.json", (c) => c.json(OpenApiDoc))
app.get("/doc", swaggerUI({ url: "/api/doc.json" }))

// API Route setup
const wsrpc = setupWebsocket(app)
app.route("/p", proxyRoute)
app.route("/auth", auth)
app.route("/ws", wsrpc.route)
app.route("/rpc", httprpc)

const server = serve(
  {
    fetch: app.fetch,
    hostname: "0.0.0.0",
    port: parseInt(process.env.SERVER_PORT ?? "3002"),
  },
  (info) => {
    logger.debug(`Server is running on http://localhost:${info.port}`)
  },
)

loadScheduler()

wsrpc.injectWebSocket(server)
