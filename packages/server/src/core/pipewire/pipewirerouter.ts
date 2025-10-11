import { logger } from "@/core/logger"
import { exec } from "child_process"
import { promisify } from "util"
import { ApplicationStreamMap, AudioSink, AudioStream } from "./types"

const execPromise = promisify(exec)

export class PipeWireRouter {
  private async executeCommand(command: string): Promise<string> {
    try {
      const { stdout } = await execPromise(command)
      return stdout.trim()
    } catch (error) {
      logger.error(`Error executing command: ${command}`)
      throw new Error(`Shell command failed: ${error}`)
    }
  }

  public async getDefaultSinkName(): Promise<string> {
    let defaultSinkName = ""
    try {
      defaultSinkName = await this.executeCommand(
        'pactl info | grep "Default Sink:" | awk "{print $3}"',
      )
    } catch (e) {}
    return defaultSinkName.replaceAll("Default Sink:", "").trim()
  }

  public async listSinks(): Promise<AudioSink[]> {
    const stdout = await this.executeCommand("pactl list short sinks")

    let defaultSinkName = await this.getDefaultSinkName()
    return stdout
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const parts = line.split("\t")
        const id = parseInt(parts[0], 10)
        const name = parts[1]
        const description = parts.length > 3 ? parts[3] : name // Use name if description is missing

        return {
          id,
          name,
          description: description.replace("module-alsa-card.c", "").trim(), // Clean up description
          isDefault: name === defaultSinkName,
        }
      })
  }

  public async listActiveStreams(): Promise<AudioStream[]> {
    const stdout = await this.executeCommand("pactl list sink-inputs")
    const streams: AudioStream[] = []
    let currentStream: Partial<AudioStream> = {}

    const idRegex = /Sink Input #(\d+)/
    const sinkRegex = /Sink: (\d+)/
    const appNameRegex =
      /application\.name = "(.+?)"|media\.name = "(.+?)"|client\.description = "(.+?)"/

    for (const line of stdout.split("\n")) {
      const trimmedLine = line.trim()

      const idMatch = trimmedLine.match(idRegex)
      if (idMatch) {
        if (currentStream.id !== undefined) {
          streams.push(currentStream as AudioStream)
        }
        currentStream = { id: parseInt(idMatch[1], 10), applicationName: "Unknown Stream" }
        continue
      }

      if (currentStream.id !== undefined) {
        const sinkMatch = trimmedLine.match(sinkRegex)
        if (sinkMatch) {
          currentStream.sinkId = parseInt(sinkMatch[1], 10)
          continue
        }

        const appNameMatch = trimmedLine.match(appNameRegex)
        if (appNameMatch) {
          currentStream.applicationName =
            appNameMatch[1] || appNameMatch[2] || appNameMatch[3] || "Unknown Stream"
        }
      }
    }

    if (currentStream.id !== undefined) {
      streams.push(currentStream as AudioStream)
    }

    return streams
  }

  public async listActiveStreamsByApplication(): Promise<ApplicationStreamMap> {
    const allStreams = await this.listActiveStreams()

    const groupedStreams: ApplicationStreamMap = {}

    for (const stream of allStreams) {
      const appName = stream.applicationName || "Unknown Stream"

      if (!groupedStreams[appName]) {
        groupedStreams[appName] = []
      }
      groupedStreams[appName].push(stream)
    }

    return groupedStreams
  }

  public async redirectStream(streamId: number, targetSinkName: string): Promise<void> {
    if (!streamId || !targetSinkName) {
      throw new Error("Stream ID and Target Sink Name are required for redirection.")
    }

    const command = `pactl move-sink-input ${streamId} ${targetSinkName}`
    logger.trace(`Executing: ${command}`)

    await this.executeCommand(command)
    logger.trace(`✅ Successfully moved stream ID ${streamId} to sink ${targetSinkName}.`)
  }

  public async redirectApplicationToDefaultSink(streamId: number): Promise<void> {
    if (!streamId) {
      throw new Error("Stream ID is required for redirection.")
    }

    const defaultSinkAlias = "@DEFAULT_SINK@"

    const command = `pactl move-sink-input ${streamId} ${defaultSinkAlias}`
    logger.trace(`Executing: ${command}`)

    await this.executeCommand(command)
    logger.trace(
      `✅ Successfully moved stream ID ${streamId} to the current default sink (${defaultSinkAlias}).`,
    )
  }

  public async setDefaultSink(targetSinkId: number): Promise<void> {
    if (!targetSinkId) {
      throw new Error("Target Sink ID is required to set the default sink.")
    }

    const command = `wpctl set-default ${targetSinkId}`
    logger.trace(`Executing: ${command}`)

    await this.executeCommand(command)
    logger.trace(`✅ Successfully set sink ID ${targetSinkId} as the new default.`)
  }
}
