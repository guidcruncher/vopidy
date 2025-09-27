// RadioBrowserHostResolver.js

import { Http } from "@/core/http/"
import { logger } from "@/core/logger"
import * as dns from "dns"
import * as util from "util"

// Utility function to check if a date is older than an hour
const OneHourAgo = (date) => {
  const hour = 1000 * 60 * 60
  const hourago = Date.now() - hour
  return date <= hourago
}

const resolveSrv = util.promisify(dns.resolveSrv)

// Store for hosts that have failed a health check within the last hour
const badHosts = []

export class RadioBrowserHostResolver {
  /**
   * Discovers and returns a healthy base URL for the Radio Browser API.
   * @returns {Promise<string>} A healthy base URL string (e.g., 'https://host.name').
   */
  async getBaseUrl() {
    // 1. Clean up stale entries in badHosts (older than one hour)
    let index = badHosts.findIndex((item) => OneHourAgo(item.date))
    while (index !== -1) {
      badHosts.splice(index, 1)
      index = badHosts.findIndex((item) => OneHourAgo(item.date))
    }

    let host = ""
    // 2. Resolve SRV record, sort, map to HTTPS URLs, and filter out current bad hosts
    let hosts = (await resolveSrv("_api._tcp.radio-browser.info"))
      .sort()
      .map((h) => `https://${h.name}`)
      .filter((h) => !badHosts.some((bh) => bh["host"] === h))

    // 3. Loop through available hosts to find a healthy one
    while (hosts.length > 0) {
      // Pick a random host
      index = Math.floor(Math.random() * hosts.length)
      host = hosts[index]

      try {
        logger.warn(`Checking host: ${host} (${hosts.length} remaining)`)
        // Use an HTTP HEAD or small GET request for a health check
        const res = await Http.get(host, false) // Assuming 'false' bypasses some auth/parsing

        if (res.ok) {
          return host // Found a good host!
        }

        // If not ok (e.g., HTTP status error), treat as bad host
        this.markHostAsBad(host)
        // Re-filter hosts list to exclude the newly marked bad host
        hosts = (await resolveSrv("_api._tcp.radio-browser.info"))
          .sort()
          .map((h) => `https://${h.name}`)
          .filter((h) => !badHosts.some((bh) => bh["host"] === h))
        host = "" // Reset host for next loop
      } catch (err) {
        // If request fails (e.g., network error), treat as bad host
        this.markHostAsBad(host)
        // Re-filter hosts list
        hosts = (await resolveSrv("_api._tcp.radio-browser.info"))
          .sort()
          .map((h) => `https://${h.name}`)
          .filter((h) => !badHosts.some((bh) => bh["host"] === h))
        host = "" // Reset host for next loop
      }
    }

    return "" // Return empty string if no healthy host could be found
  }

  /**
   * Marks a host as bad, adding it to the badHosts list with a timestamp.
   * @param {string} host The URL of the bad host.
   */
  markHostAsBad(host) {
    if (!badHosts.some((h) => h["host"] === host)) {
      badHosts.push({ date: Date.now(), host: host })
      logger.warn(`Marked host as bad: ${host}`)
    }
  }
}
