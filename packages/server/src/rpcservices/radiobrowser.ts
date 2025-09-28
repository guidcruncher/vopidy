import { RpcService, ServiceModule } from "@/core/jsonrpc/types"
import { RadioBrowser } from "@/services/radiobrowser"

class RadioBrowserService implements RpcService {
  public async browse(name: string) {
    const rbClient = new RadioBrowser()

    return rbClient.browse(name, 0, 0, false)
  }

  public async countries() {
    const rbClient = new RadioBrowser()

    return rbClient.countries()
  }

  public async regions(code: string, country: string) {
    const rbClient = new RadioBrowser()

    return rbClient.states(code, country)
  }

  public async states(code: string, name: string) {
    const rbClient = new RadioBrowser()

    return rbClient.states(code, name)
  }
}

export const namespace = "radiobrowser"
export const service = new RadioBrowserService()

const module: ServiceModule = { namespace, service }
export default module
