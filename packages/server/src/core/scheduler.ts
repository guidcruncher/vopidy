import { Config } from "@/core/config"
import { logger } from "@/core/logger"
import { tts } from "@/services/tts"
import cron from "node-cron"

export class SchedulerInstance {
  public async hourly() {
    const config = Config.load()
    const current = new Date()
    const ttsClient = new tts()
    const locale = (config.locale ?? "en-US").split("-")

    logger.trace(`Hourly cron ${current.toISOString()}`)

    if (config.announceTimeHourly && !Config.isNight()) {
      let date = Config.localDateString()
      await ttsClient.speak(locale[0], `It's ${date}`)
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
