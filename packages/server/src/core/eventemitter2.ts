import { EventEmitter } from "node:events"
import { HTTPException } from "hono/http-exception"

export type listener = (...args) => {}

export class EventEmitter2 {
  private emitter: EventEmitter

  private static _instance: EventEmitter2

  private constructor() {
    this.emitter = new EventEmitter()
  }

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  public exists(event: string) {
    return this.emitter.eventNames().includes(event)
  }

  public on(event: string, func: listener) {
    if (this.exists(event)) {
      throw new HTTPException(500, {
        message: `Event listener already exists: ${event}`,
      })
    }

    this.emitter.on(event, func)
  }

  public off(event: string) {
    this.emitter.removeAllListeners(event)
  }

  public removeAll() {
    this.emitter.removeAllListeners()
  }

  public emit(event: string, ...args) {
    global.logger.debug(`Emitvp ${event}`)
    return this.emitter.emit(event, args)
  }

  public emitClientEvent(event: string, args: any) {
    const ev = { event: event, data: args }
    return this.emitter.emit("ws-event", ev)
  }
}

export const on = EventEmitter2.Instance.on
export const off = EventEmitter2.Instance.off
export const emit = EventEmitter2.Instance.emit
