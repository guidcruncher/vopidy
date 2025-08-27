import { Hono } from "hono"
import { prettyJSON } from "hono/pretty-json"
import { swaggerUI } from "@hono/swagger-ui"
import { cors } from "hono/cors"
import * as crypto from "crypto"
import { AppEnv } from "@/core/appenv"
import { Config } from "@/core/config"
import { OpenApiDoc } from "@/routes/openapidoc"
import { auth } from "@/routes/auth"
import { logger } from "@/core/logger"
import { httprpc, setupWebsocket } from "@/routes/jsonrpc"
import { proxyRoute } from "@/routes/proxy"
import { ProcessLauncher } from "@/core/processlauncher"
import { serve } from "@hono/node-server"
import { contextStorage, getContext } from "hono/context-storage"

ProcessLauncher.start()
const cfg = Config.load()
const app = new Hono<AppEnv>()

app.use(contextStorage())

app.use(async (c, next) => {
  const reqId = c.req.header("X-Request-ID") ?? crypto.randomBytes(8).toString("hex")
  c.set("RequestID", reqId)
  const start = Date.now()
  logger.trace(`Begin`)
  await next()
  const end = Date.now()
  logger.trace(`End in ${end - start}ms`)
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
    port: parseInt(process.env.SERVER_PORT ?? "3002"),
  },
  (info) => {
    logger.debug(`Server is running on http://localhost:${info.port}`)
  },
)

wsrpc.injectWebSocket(server)
