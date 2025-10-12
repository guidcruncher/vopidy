import { logger } from "@/core/logger"
import { exec, ExecException, execSync } from "child_process"
import { promisify } from "util"

const execPromise = promisify(exec)

export const executeCommand = async (command: string): Promise<string> => {
  try {
    const { stdout, stderr } = await execPromise(command)
    if (stderr) {
      logger.warn(`pactl command produced stderr for: ${command}\nStderr: ${stderr.trim()}`)
    }
    return stdout.trim()
  } catch (error) {
    const err = error as ExecException
    logger.error(`Command failed: ${command}`, error)
    throw new Error(`Command failed: ${command}\nStderr: ${err.stderr || err.message}`)
  }
}

export const executeCommandSync = (command: string): string => {
  try {
    const stdout = execSync(command, { encoding: "utf-8", stdio: "pipe" }).trim()
    return stdout.trim()
  } catch (error) {
    const err = error as ExecException
    logger.error(`Command failed: ${command}`, error)
    throw new Error(`Command failed: ${command}\nStderr: ${err.stderr || err.message}`)
  }
}
