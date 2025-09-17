export class JsonRpcMessage {
  jsonrpc = "2.0"

  method: string

  params: any[]

  id: number

  constructor() {
    this.jsonrpc = "2.0"
    this.id = 0
    this.method = ""
    this.params = [] as any[]
  }
}
