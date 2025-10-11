export enum LogLevel {
  TRACE = 0, // Very fine-grained informational events
  DEBUG = 1, // Fine-grained informational events
  INFO = 2, // Coarse-grained informational events (default)
  WARN = 3, // Potentially harmful situations
  ERROR = 4, // Error events that might still allow the app to continue
  FATAL = 5, // Very severe error events that will presumably lead to app abort
  OFF = 6, // Turn off all logging
}

const ANSI_COLORS = {
  Reset: "\x1b[0m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgCyan: "\x1b[36m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
}

export class logger {
  private static minLevel: LogLevel = LogLevel.TRACE

  public static setMinLevel(level: LogLevel): void {
    logger.minLevel = level
  }

  private static getLogParams(level: LogLevel): {
    method: (...data: any[]) => void
    ansiColor: string
  } {
    switch (level) {
      case LogLevel.TRACE:
        return { method: console.debug, ansiColor: ANSI_COLORS.FgCyan + ANSI_COLORS.Dim } // Dim Cyan
      case LogLevel.DEBUG:
        return { method: console.debug, ansiColor: ANSI_COLORS.FgCyan }
      case LogLevel.INFO:
        return { method: console.info, ansiColor: ANSI_COLORS.FgGreen }
      case LogLevel.WARN:
        return { method: console.warn, ansiColor: ANSI_COLORS.FgYellow }
      case LogLevel.ERROR:
        return { method: console.error, ansiColor: ANSI_COLORS.FgRed }
      case LogLevel.FATAL:
        return { method: console.error, ansiColor: ANSI_COLORS.FgRed + ANSI_COLORS.Bright } // Bright Red
      default:
        return { method: console.log, ansiColor: ANSI_COLORS.Reset }
    }
  }

  private static getCallerLocation(): string {
    try {
      // Throws an Error to capture the stack trace
      throw new Error()
    } catch (e: any) {
      const stack = e.stack || ""
      const lines = stack.split("\n")

      // We need to skip 4 lines to get past the internal logger calls:
      // 0: Error
      // 1: getCallerLocation
      // 2: log
      // 3: Public method (info/debug/etc.)
      // 4: The actual caller
      const CALLER_INDEX = 4

      if (lines.length > CALLER_INDEX) {
        const line = lines[CALLER_INDEX].trim()

        // Regex to extract the file:line:column part from the end of a Node stack line:
        // e.g., '    at Function.actualFunction (/project/src/app.ts:50:9)'
        const match = line.match(/\(([^)]+)\)$/)
        if (match && match[1]) {
          const fullPath = match[1]
          const parts = fullPath.split("/")
          return parts[parts.length - 1] // Return just the filename:line:column
        }
      }
    }
    return ""
  }

  private static writeLog(
    level: LogLevel,
    levelName: keyof typeof LogLevel,
    message: any,
    optionalParams: any[],
  ): void {
    if (logger.minLevel <= level) {
      const { method, ansiColor } = logger.getLogParams(level)
      const timestamp = new Date().toISOString()

      // Get the location (e.g., app.ts:50:9)
      const location = logger.getCallerLocation()

      // Construct the prefix with color and location
      const prefix = `[${levelName}] ${timestamp} [${location}]`

      // Terminal logging using ANSI escape codes
      const coloredPrefix = `${ansiColor}${prefix}${ANSI_COLORS.Reset} -`
      method(coloredPrefix, message, ...optionalParams)
    }
  }

  public static trace(message: any, ...optionalParams: any[]): void {
    logger.writeLog(LogLevel.TRACE, "TRACE", message, optionalParams)
  }

  public static debug(message: any, ...optionalParams: any[]): void {
    logger.writeLog(LogLevel.DEBUG, "DEBUG", message, optionalParams)
  }

  public static info(message: any, ...optionalParams: any[]): void {
    logger.writeLog(LogLevel.INFO, "INFO", message, optionalParams)
  }

  public static warn(message: any, ...optionalParams: any[]): void {
    logger.writeLog(LogLevel.WARN, "WARN", message, optionalParams)
  }

  public static log(message: any, ...optionalParams: any[]): void {
    logger.writeLog(LogLevel.INFO, "INFO", message, optionalParams)
  }

  public static error(message: any, ...optionalParams: any[]): void {
    logger.writeLog(LogLevel.ERROR, "ERROR", message, optionalParams)
  }

  public static fatal(message: any, ...optionalParams: any[]): void {
    logger.writeLog(LogLevel.FATAL, "FATAL", message, optionalParams)
  }
}
