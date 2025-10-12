import { logger } from "@/core/logger"
import * as fs from "fs/promises"
import * as path from "path"
import { EqualizerPreset, PresetFileInfo } from "./types"

export class EqualizerPresetManager {
  public async readPresetFile(filename: string): Promise<EqualizerPreset> {
    const filePath = filename
    try {
      const fileContent = await fs.readFile(filePath, { encoding: "utf-8" })
      const preset: EqualizerPreset = JSON.parse(fileContent)

      if (typeof preset.equalizer_preset_name !== "string") {
        throw new Error(
          `Invalid preset format: 'equalizer_preset_name' missing or invalid in ${filePath}`,
        )
      }

      return preset
    } catch (error) {
      logger.error(`Error reading or parsing file ${filePath}:`, error)
      throw error
    }
  }

  public async writePresetFile(filename: string, preset: EqualizerPreset): Promise<void> {
    const filePath = filename
    try {
      const jsonContent = JSON.stringify(preset, null, 2)
      await fs.writeFile(filePath, jsonContent, { encoding: "utf-8" })
      logger.trace(`Successfully wrote preset file to: ${filePath}`)
    } catch (error) {
      logger.error(`Error writing file ${filePath}:`, error)
      throw error
    }
  }

  public fullPath(filename: string) {
    const basePath = process.env.MIXERDESK_BASE ? process.env.MIXERDESK_BASE.toString() : ""
    return path.join(basePath, "/eq/", filename)
  }

  public async generatePresetList(): Promise<PresetFileInfo[]> {
    const fileList: PresetFileInfo[] = []
    const directoryPath = path.join(process.env.MIXERDESK_BASE.toString(), "/eq/")
    try {
      const files = await fs.readdir(directoryPath)

      const jsonFiles = files.filter((file) => path.extname(file).toLowerCase() === ".json")

      const readPromises = jsonFiles.map(async (fileName) => {
        const fullPath = path.join(directoryPath, fileName)

        try {
          const preset = await this.readPresetFile(fullPath)
          fileList.push({
            fileName: fileName,
            equalizerPresetName: preset.equalizer_preset_name,
            fullPath: fullPath,
          })
        } catch (e) {
          logger.warn(`Skipping malformed file: ${fileName}`, e)
        }
      })

      await Promise.all(readPromises)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        logger.warn(`Preset directory not found: ${directoryPath}`)
        return []
      }
      logger.error(`Error reading directory ${directoryPath}:`, error)
      throw error
    }

    return fileList
  }
}
