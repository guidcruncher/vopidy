import { RpcService, ServiceModule } from "@/core/jsonrpc/types"

class CalculatorService implements RpcService {
  public async add(a: number, b: number): Promise<number> {
    if (typeof a !== "number" || typeof b !== "number") {
      throw new Error("Invalid parameters: Both arguments must be numbers.")
    }
    return a + b
  }

  public subtract(a: number, b: number): number {
    return a - b
  }
}

export const namespace = "calc"
export const service = new CalculatorService()

const module: ServiceModule = { namespace, service }
export default module
