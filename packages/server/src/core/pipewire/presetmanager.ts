import { logger } from "@/core/logger"
import * as fs from "fs/promises"
import * as path from "path"

export interface Band {
  frequency_hz: number
  gain_db: number
  notes: string
}

export interface EqualizerPreset {
  equalizer_preset_name: string
  description: string
  bands: Band[]
}

export interface PresetFileInfo {
  fileName: string
  equalizerPresetName: string
  fullPath: string
}

export class EqualizerPresetManager {
  public async readPresetFile(filename: string): Promise<EqualizerPreset> {
    const filePath = filename
    try {
      const fileContent = await fs.readFile(filePath, { encoding: "utf-8" })
      // Note: Basic JSON parsing is used. For production, consider adding validation.
      const preset: EqualizerPreset = JSON.parse(fileContent)

      // Basic check for the required field
      if (typeof preset.equalizer_preset_name !== "string") {
        throw new Error(
          `Invalid preset format: 'equalizer_preset_name' missing or invalid in ${filePath}`,
        )
      }

      return preset
    } catch (error) {
      logger.error(`Error reading or parsing file ${filePath}:`, error)
      throw error // Re-throw to allow caller to handle the failure
    }
  }

  public async writePresetFile(filename: string, preset: EqualizerPreset): Promise<void> {
    const filePath = filename
    try {
      // Use 2 spaces for indentation for human-readable JSON
      const jsonContent = JSON.stringify(preset, null, 2)
      await fs.writeFile(filePath, jsonContent, { encoding: "utf-8" })
      logger.trace(`Successfully wrote preset file to: ${filePath}`)
    } catch (error) {
      logger.error(`Error writing file ${filePath}:`, error)
      throw error
    }
  }

  public fullPath(filename: string) {
    return path.join(process.env.MIXERDESK_BASE.toString(), "/eq/", filename)
  }

  public async generatePresetList(): Promise<PresetFileInfo[]> {
    const fileList: PresetFileInfo[] = []
    const directoryPath = path.join(process.env.MIXERDESK_BASE.toString(), "/eq/")
    try {
      const files = await fs.readdir(directoryPath)

      // Filter for JSON files
      const jsonFiles = files.filter((file) => path.extname(file).toLowerCase() === ".json")

      // Process files concurrently for better performance
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
          // Log error but continue with the rest of the files
          logger.warn(`Skipping malformed file: ${fileName}`)
        }
      })

      // Wait for all file reading operations to complete
      await Promise.all(readPromises)
    } catch (error) {
      logger.error(`Error reading directory ${directoryPath}:`, error)
      throw error
    }

    return fileList
  }
}
