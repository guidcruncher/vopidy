import { getContext } from "hono/context-storage"

export type AppEnv = {
  Variables: {
    RequestID: string
  }
}

export const currentRequestId = () => {
  try {
    return getContext<AppEnv>().var.RequestID ?? ""
  } catch (err) {
    return ""
  }
}
