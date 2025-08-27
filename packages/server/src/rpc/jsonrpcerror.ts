export class JsonRpcErrorObject {
  code: number

  message: string

  data: any

  constructor(code: number, message: string, data: any = undefined) {
    this.code = code
    this.message = message
    this.data = data
  }
}

export class JsonRpcErrorResponse {
  jsonrpc = "2.0"

  error: JsonRpcErrorObject

  id: number

  constructor(code: number, message: string, data: any, id: number = undefined) {
    this.jsonrpc = "2.0"
    this.id = id
    this.error = new JsonRpcErrorObject(code, message, data)
  }
}

export class JsonRpcError {
  public ParseError = -32700

  public InvalidRequest = -32600

  public MethodNotFound = -32601

  public InvalidParams = -32602

  public InternalError = -32603

  public ServerError = -32000

  public ServerOverloaded = -32001

  public RateLimitExceeded = -3202

  public SessionExpired = -32003

  public MethodNotReady = -32004

  public InvalidBatchRequest = -32040

  public ContentTypeError = -32050

  public TransportError = -32060

  public TimeoutError = -32070
}
