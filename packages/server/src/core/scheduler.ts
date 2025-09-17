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

      if (config.nightEndHour && config.nightEndHour == Config.localDate().getHours()) {
        await ttsClient.speak(locale[0], `Good Morning, It's ${date}`)
      } else {
        if (config.nightStartHour && config.nightStartHour == Config.localDate().getHours()) {
          await ttsClient.speak(locale[0], `It's ${date}, Good night.`)
        } else {
          if (Config.localDate().getHours() == 12) {
            await ttsClient.speak(locale[0], `Good afternoon, It's ${date}`)
          } else {
            await ttsClient.speak(locale[0], `It's ${date}`)
          }
        }
      }
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
