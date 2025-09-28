import { logger } from "@/core/logger"
import * as DynamicRoute from "./dynamicroute"
import * as StaticRoute from "./staticroute"

export function route(mode: string) {
  switch (mode.toLowerCase()) {
    case "dynamic":
      logger.warn("Using Dynamic Service Registry")
      return DynamicRoute
    case "static":
      logger.warn("Using Static Service Registry")
      return StaticRoute
  }

  logger.warn("Using default of Dynamic Service Registry")
  return DynamicRoute
}
