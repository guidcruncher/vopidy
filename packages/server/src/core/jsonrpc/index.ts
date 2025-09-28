import * as DynamicRoute from "./dynamicroute"
import * as StaticRoute from "./staticroute"

export default function route(mode: string) {
  switch (mode.toLowerCase()) {
    case "dynamic":
      return DynamicRoute
    case "static":
      return StaticRoute
  }

  return undefined
}
