import { PagedItems } from "@/core/paging"
import { TuneInApi } from "./tuneinapi"
import { TuneInService } from "./tuneinservice"

/**
 * The TuneIn Facade provides a simplified interface to the complex TuneIn
 * API and service layer, hiding the specifics of data fetching, parsing,
 * and integration with application components (Mixer, DB, etc.).
 */
export class TuneIn {
  private api: TuneInApi
  private service: TuneInService

  constructor() {
    this.api = new TuneInApi()
    this.service = new TuneInService(this.api)
  }

  /**
   * Delegates to TuneInApi to fetch top-level categories.
   */
  public async categories() {
    return this.api.getCategories()
  }

  /**
   * Delegates to TuneInApi to browse a specific category/list ID.
   */
  public async browse(id: string) {
    return this.api.browse(id)
  }

  /**
   * Delegates to TuneInService to execute the full playback logic,
   * which involves fetching stream URLs, starting the player, and updating state.
   */
  public async play(id: string) {
    // The service handles both description and stream fetching internally
    return this.service.play(id)
  }

  /**
   * Delegates to TuneInApi to fetch descriptive metadata for a station.
   * This is a simple data retrieval operation.
   */
  public async describe(id: string) {
    return this.api.describe(id)
  }

  /**
   * Delegates to TuneInService to execute the search, which includes
   * fetching, sorting, and wrapping results in a PagedItems structure.
   */
  public async search(query: string, offset: number, limit: number): Promise<PagedItems<any>> {
    return this.service.search(query, offset, limit)
  }
}
