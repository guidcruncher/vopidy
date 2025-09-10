import cron from "node-cron"
import { Config } from "@/core/config"

export class SchedulerInstance {
  public hourly() {
    const config = Config.load()
    const current = new Date()
  }
}

export const Scheduler = () => {
  const config = Config.load()
  const scheduler = new ScheduleInstance()

  if (config.nightStartHour && config.nightEndHour) {
    cron.schedule(`0 ${config.nightEndHour}-${config.nightStartHour} * * *`, () => {})
  }

  cron.schedule("0 * * * *", () => {
    scheduler.hourly()
  })
}
