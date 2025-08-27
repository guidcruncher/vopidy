import { colorConsole } from "tracer"
import { currentRequestId } from "@/core/appenv"

export const logger = colorConsole({
  format: [
    "{{timestamp}} <{{title}}> {{requestid}} {{message}} (in {{file}}:{{line}})",
    {
      error:
        "{{timestamp}} <{{title}}> {{requestid}} {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}",
    },
  ],
  dateformat: "HH:MM:ss.L",
  preprocess: function (data) {
    data["requestid"] = currentRequestId()
    return data
  },
})
