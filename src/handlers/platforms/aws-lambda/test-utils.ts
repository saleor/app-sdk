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
  overrides: Partial<APIGatewayProxyEventV2> = {}
): APIGatewayProxyEventV2 {
  const path = "/some-path";
  return {
    version: "2.0",
    routeKey: `POST ${path}`,
    rawPath: path,
    rawQueryString: "",
    headers: {},
    requestContext: {
      accountId: "123456789012",
      apiId: "api-id",
      domainName: "example.com",
      domainPrefix: "example",
      http: {
        method: "POST",
        path,
        protocol: "HTTP/1.1",
        sourceIp: "192.168.0.1",
        userAgent: "vitest-test",
      },
      requestId: "test-request-id",
      routeKey: `POST /${path}`,
      stage: "test",
      time: "03/Feb/2025:16:00:00 +0000",
      timeEpoch: Date.now(),
    },
    body: "",
    isBase64Encoded: false,
    ...overrides,
  };
}
