import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { vi } from "vitest";

export const mockLambdaContext: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: "testFunction",
  functionVersion: "1",
  invokedFunctionArn: "arn:aws:lambda:us-east-1:123456789012:function:test",
  memoryLimitInMB: "128",
  awsRequestId: "test-request-id",
  logGroupName: "test-log-group",
  logStreamName: "test-log-stream",
  getRemainingTimeInMillis: () => 10000,
  done: vi.fn(),
  fail: vi.fn(),
  succeed: vi.fn(),
};

export function createLambdaEvent(
  config: Omit<Partial<APIGatewayProxyEventV2>, "requestContext"> & {
    requestContext?: Partial<APIGatewayProxyEventV2["requestContext"]>;
    path?: string;
    method?: "POST" | "GET";
  } = {},
): APIGatewayProxyEventV2 {
  const {
    path = "/some-path",
    method = "POST",
    requestContext: requestContextOverrides,
    ...overrides
  } = config ?? {};

  return {
    version: "2.0",
    routeKey: `${method} ${path}`,
    rawPath: path,
    rawQueryString: "",
    headers: {},
    body: "",
    isBase64Encoded: false,
    ...overrides,
    requestContext: {
      accountId: "123456789012",
      apiId: "api-id",
      domainName: "example.com",
      domainPrefix: "example",
      http: {
        method,
        path,
        protocol: "HTTP/1.1",
        sourceIp: "192.168.0.1",
        userAgent: "vitest-test",
        ...requestContextOverrides?.http,
      },
      requestId: "test-request-id",
      routeKey: `${method} /${path}`,
      stage: "$default",
      time: "03/Feb/2025:16:00:00 +0000",
      timeEpoch: Date.now(),
      ...requestContextOverrides,
    },
  };
}
