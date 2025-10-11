import { Config } from "@/core/config"
import { logger } from "@/core/logger"
import { Tts } from "@/services/tts/"
import cron from "node-cron"

export class SchedulerInstance {
  public async hourly() {
    const config = Config.load()
    const current = new Date()
    const ttsClient = new Tts()
    const locale = (config.locale ?? "en-US").split("-")

    logger.trace(`Hourly cron ${current.toISOString()}`)

    if (config.announceTimeHourly && !Config.isNight()) {
      let date = Config.localDateString()
      let greetings = config.timeGreetings ?? {
        hourly: "It's {date}",
        start: "Good Morning, It's {date}",
        midday: "Good afternoon, It's {date}",
        end: "It's {date}, Good night",
      }

      if (config.nightEndHour && config.nightEndHour == Config.localDate().getHours()) {
        await ttsClient.speak(locale[0], greetings.start.replaceAll("{date}", date))
      } else {
        if (config.nightStartHour && config.nightStartHour == Config.localDate().getHours()) {
          await ttsClient.speak(locale[0], greetings.end.replaceAll("{date}", date))
        } else {
          if (Config.localDate().getHours() == 12) {
            await ttsClient.speak(locale[0], greetings.midday.replaceAll("{date}", date))
          } else {
            await ttsClient.speak(locale[0], greetings.hourly.replaceAll("{date}", date))
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
