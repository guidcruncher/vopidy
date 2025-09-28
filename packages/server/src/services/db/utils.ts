// utilityService.ts
import * as crypto from "crypto"

/**
 * Provides common utility functions.
 */
export class UtilityService {
  /**
   * Generates a new cryptographically secure base64url URI.
   * @returns A new unique URI string.
   */
  public static newUri(): string {
    const id = crypto.randomBytes(16).toString("hex")
    // Creates a unique, URL-safe ID
    return crypto.createHash("sha256").update(id).digest("base64url")
  }
}
