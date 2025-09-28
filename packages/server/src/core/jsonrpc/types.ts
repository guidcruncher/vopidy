export interface JsonRpcRequest {
  jsonrpc: "2.0"
  method: string
  params?: any
  id: string | number | null
}

export interface JsonRpcResponse {
  jsonrpc: "2.0"
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
  id: string | number | null
}

export const enum JsonRpcErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  ApplicationError = -32000,
}

// --- Dynamic Service Interface ---
export interface RpcService {
  [key: string]: (...args: any[]) => Promise<any> | any
}

// Defines the expected structure of a dynamically imported service file
export interface ServiceModule {
  namespace: string
  service: RpcService
}
