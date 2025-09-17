export class JsonRpcResponse {
  jsonrpc = "2.0"

  result: any

  id: number

  constructor(id: number, result: any) {
    this.jsonrpc = "2.0"
    this.id = id
    this.result = result
  }
}
