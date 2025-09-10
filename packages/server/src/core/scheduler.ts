import { logger } from "@/core/logger"
import cron from "node-cron"
import { Config } from "@/core/config"
import { tts } from "@/services/tts"

export class SchedulerInstance {
  public async hourly() {
    const config = Config.load()
    const current = new Date()
    const ttsClient = new tts()
    const locale = (config.locale ?? "en-US").split("-")

    logger.trace(`Hourly cron ${current.toISOString()}`)

    if (config.announceTimeHourly && !Config.isNight()) {
      let date = Config.localDateString()
      await ttsClient.speak(locale[0], date)
    }
  }
}

export const loadScheduler = () => {
  const config = Config.load()
  const scheduler = new SchedulerInstance()

  cron.schedule("0 * * * *", async () => {
    await scheduler.hourly()
  })
}
