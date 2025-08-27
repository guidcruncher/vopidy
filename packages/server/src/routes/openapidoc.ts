export const OpenApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "Vopidy Music Server API",
    version: "1.0.0",
    description: "API documentation for the Vopidy Music Server",
  },
  paths: {
    "/api/rpc": {
      post: {
        summary: "Perform Json-rpc requests ",
        consumes: "application/json",
        produces: "application/json",
        requestBody: {
          description: "The Json-Rpc Request or notification",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/JsonRpcMessage",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Successful",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/JsonRpcResponse" } },
            },
          },
        },
      },
    },
    "/api/auth": {
      get: {
        summary: "Perform Oauth authorization ",
        responses: {
          "302": {
            description: "Redirection to authorize endpoint",
          },
        },
      },
    },
    // Add more endpoints as needed
  },
  components: {
    schemas: {
      JsonRpcMessage: {
        type: "object",
        required: ["jsonrpc", "method", "params"],
        properties: {
          jsonrpc: { type: "string", default: "2.0" },
          id: {
            type: "integer",
            format: "int64",
          },
          method: {
            type: "string",
          },
          params: { type: "array", items: { type: "string" } },
        },
        xml: {
          name: "JsonRpcMessage",
        },
      },
      JsonRpcResponse: {
        type: "object",

        required: ["jsonrpc", "id"],
        properties: {
          jsonrpc: { type: "string", default: "2.0" },
          id: {
            type: "integer",
            format: "int64",
          },
          result: {
            type: "object",
          },
        },
        xml: {
          name: "JsonRpcResponse",
        },
      },
      JsonRpcError: {
        type: "object",
        required: ["jsonrpc", "id", "error"],
        properties: {
          jsonrpc: { type: "string", default: "2.0" },
          id: {
            type: "integer",
            format: "int64",
          },
          error: {
            type: "object",
          },
        },
        xml: {
          name: "JsonRpcError",
        },
      },
    },
  },
}
