import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "aws-lambda";

import {
  HandlerUseCaseResult,
  PlatformAdapterInterface,
} from "../shared/generic-adapter-use-case-types";

export type AwsLambdaHandlerInput = APIGatewayProxyEventV2;
export type AWSLambdaHandler = (
  event: APIGatewayProxyEventV2,
  context: Context
) => Promise<APIGatewayProxyResultV2>;

export class AwsLambdaAdapter implements PlatformAdapterInterface<AwsLambdaHandlerInput> {
  public request: AwsLambdaHandlerInput;

  constructor(private event: APIGatewayProxyEventV2, private context: Context) {
    this.request = event;
  }

  getHeader(name: string): string | null {
    return this.request.headers[name] || null;
  }

  async getBody(): Promise<unknown | null> {
    try {
      return JSON.parse(this.request.body || "{}");
    } catch (err) {
      return null;
    }
  }

  get method(): string {
    return this.event.requestContext.http.method;
  }

  async send(result: HandlerUseCaseResult): Promise<APIGatewayProxyResultV2> {
    const body = result.bodyType === "json" ? JSON.stringify(result.body) : result.body;

    return {
      statusCode: result.status,
      headers: {
        "Content-Type": result.bodyType === "json" ? "application/json" : "text/plain",
      },
      body,
    };
  }
}
