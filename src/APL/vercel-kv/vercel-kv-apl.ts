import { SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";
import { kv } from "@vercel/kv";

import { getOtelTracer, OTEL_APL_SERVICE_NAME } from "../../open-telemetry";
import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "../apl";
import { createAPLDebug } from "../apl-debug";

type Params = {
  hashCollectionKey?: string;
};

export class VercelKvApl implements APL {
  private debug = createAPLDebug("VercelKvApl");

  private tracer = getOtelTracer();

  /**
   * Store all items inside hash collection, to enable read ALL items when needed.
   * Otherwise, multiple redis calls will be needed to iterate over every key.
   *
   * To allow connecting many apps to single KV storage, we need to use different hash collection key for each app.
   */
  private hashCollectionKey = process.env.KV_STORAGE_NAMESPACE as string;

  constructor(options?: Params) {
    if (!this.envVariablesRequiredByKvExist()) {
      throw new Error("Missing KV env variables, please link KV storage to your project");
    }

    this.hashCollectionKey = options?.hashCollectionKey ?? this.hashCollectionKey;
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    this.debug("Will call Vercel KV to get auth data for %s", saleorApiUrl);

    return this.tracer.startActiveSpan(
      "VercelKvApl.get",
      {
        attributes: {
          saleorApiUrl,
          [SemanticAttributes.PEER_SERVICE]: OTEL_APL_SERVICE_NAME,
        },
        kind: SpanKind.CLIENT,
      },
      async (span) => {
        try {
          const authData = await kv.hget<AuthData>(this.hashCollectionKey, saleorApiUrl);

          this.debug("Received response from VercelKV");

          if (!authData) {
            this.debug("AuthData is empty for %s", saleorApiUrl);
          }

          span
            .setStatus({
              code: 200,
              message: "Received response from VercelKV",
            })
            .end();

          return authData ?? undefined;
        } catch (e) {
          this.debug("Failed to get auth data from Vercel KV");
          this.debug(e);

          span.recordException("Failed to get auth data from Vercel KV");

          span
            .setStatus({
              code: SpanStatusCode.ERROR,
              message: "Failed to get auth data from Vercel KV",
            })
            .end();

          throw e;
        }
      }
    );
  }

  async set(authData: AuthData): Promise<void> {
    this.debug("Will call Vercel KV to set auth data for %s", authData.saleorApiUrl);

    return this.tracer.startActiveSpan(
      "VercelKvApl.set",
      {
        attributes: {
          saleorApiUrl: authData.saleorApiUrl,
          appId: authData.appId,
          [SemanticAttributes.PEER_SERVICE]: OTEL_APL_SERVICE_NAME,
        },
        kind: SpanKind.CLIENT,
      },
      async (span) => {
        try {
          await kv.hset(this.hashCollectionKey, {
            [authData.saleorApiUrl]: authData,
          });

          span
            .setStatus({
              code: 200,
              message: "Successfully written auth data to VercelKV",
            })
            .end();
        } catch (e) {
          this.debug("Failed to set auth data in Vercel KV");
          this.debug(e);

          span.recordException("Failed to set auth data in Vercel KV");
          span
            .setStatus({
              code: SpanStatusCode.ERROR,
            })
            .end();

          throw e;
        }
      }
    );
  }

  async delete(saleorApiUrl: string) {
    this.debug("Will call Vercel KV to delete auth data for %s", saleorApiUrl);

    return this.tracer.startActiveSpan(
      "VercelKvApl.delete",
      {
        attributes: {
          saleorApiUrl,
          [SemanticAttributes.PEER_SERVICE]: OTEL_APL_SERVICE_NAME,
        },
        kind: SpanKind.CLIENT,
      },
      async (span) => {
        try {
          await kv.hdel(this.hashCollectionKey, saleorApiUrl);

          span
            .setStatus({
              code: 200,
              message: "Successfully deleted auth data to VercelKV",
            })
            .end();
        } catch (e) {
          this.debug("Failed to delete auth data from Vercel KV");
          this.debug(e);

          span.recordException("Failed to delete auth data from Vercel KV");
          span
            .setStatus({
              code: SpanStatusCode.ERROR,
            })
            .end();

          throw e;
        }
      }
    );
  }

  async getAll() {
    const results = await kv.hgetall<Record<string, AuthData>>(this.hashCollectionKey);

    if (results === null) {
      throw new Error("Missing KV collection, data was never written");
    }

    return Object.values(results);
  }

  async isReady(): Promise<AplReadyResult> {
    const ready = this.envVariablesRequiredByKvExist();

    return ready
      ? {
          ready: true,
        }
      : {
          ready: false,
          error: new Error("Missing KV env variables, please link KV storage to your project"),
        };
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    const configured = this.envVariablesRequiredByKvExist();

    return configured
      ? {
          configured: true,
        }
      : {
          configured: false,
          error: new Error("Missing KV env variables, please link KV storage to your project"),
        };
  }

  private envVariablesRequiredByKvExist() {
    const variables = [
      "KV_REST_API_URL",
      "KV_REST_API_TOKEN",
      "KV_REST_API_READ_ONLY_TOKEN",
      "KV_STORAGE_NAMESPACE",
      "KV_URL",
    ];

    return variables.every((variable) => !!process.env[variable]);
  }
}
