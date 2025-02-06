import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from "aws-lambda";

import {
  ActionHandlerResult,
  HTTPMethod,
  PlatformAdapterInterface,
} from "@/handlers/shared/generic-adapter-use-case-types";

export type AwsLambdaHandlerInput = APIGatewayProxyEventV2;
export type AWSLambdaHandler = (
  event: APIGatewayProxyEventV2,
  context: Context
) => Promise<APIGatewayProxyStructuredResultV2>;

/** PlatformAdapter for AWS Lambda HTTP events
 *
 * Platform adapters are used in Actions to handle generic request logic
 * like getting body, headers, etc.
 *
 * Thanks to this Actions logic can be re-used for each platform

 * @see {PlatformAdapterInterface}
 * */
export class AwsLambdaAdapter implements PlatformAdapterInterface<AwsLambdaHandlerInput> {
  public request: AwsLambdaHandlerInput;

  constructor(private event: APIGatewayProxyEventV2, private context: Context) {
    this.request = event;
  }

  getHeader(requestedName: string): string | null {
    // TODO: Check if it works correctly with both API gateway and Lambda Function URL

    // Lambda headers are always in lowercase for new deployments using API Gateway,
    // they use HTTP/2 which requires them to be lowercase
    //
    // if there are multiple values they are separated by comma: ,
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
    const name = requestedName.toLocaleLowerCase();
    return this.request.headers[name] || null;
  }

  async getBody(): Promise<unknown | null> {
    if (!this.request.body) {
      return null;
    }

    return JSON.parse(this.request.body);
  }

  async getRawBody(): Promise<string | null> {
    if (!this.request.body) {
      return null;
    }

    return this.request.body;
  }

  // This stage name is used when no stage name is provided in AWS CDK
  // this means that stage name is not appended to the lambda URL
  private DEFAULT_STAGE_NAME = "$default";

  getBaseUrl(): string {
    const xForwardedProto = this.getHeader("x-forwarded-proto") || "https";
    const host = this.getHeader("host");

    const xForwardedProtos = Array.isArray(xForwardedProto)
      ? xForwardedProto.join(",")
      : xForwardedProto;
    const protocols = xForwardedProtos.split(",");

    // prefer https, then http over other protocols
    const protocol =
      protocols.find((el) => el === "https") ||
      protocols.find((el) => el === "http") ||
      protocols[0];

    // API Gateway splits deployment into multiple stages which are
    // included in the API url (e.g. /dev or /prod)
    // default stage name means that it's not appended to the URL
    // More details: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
    const { stage } = this.event.requestContext;

    if (stage && stage !== this.DEFAULT_STAGE_NAME) {
      return `${protocol}://${host}/${stage}`;
    }

    return `${protocol}://${host}`;
  }

  get method(): HTTPMethod {
    return this.event.requestContext.http.method as HTTPMethod;
  }

  async send(result: ActionHandlerResult): Promise<APIGatewayProxyStructuredResultV2> {
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
