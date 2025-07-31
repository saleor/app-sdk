import { SpanStatusCode } from "@opentelemetry/api";

import { createDebug } from "@/debug";
import { getOtelTracer } from "@/open-telemetry";

import { APL, AuthData } from "../apl";
import { createAplEntity, UsedTable } from "./apl-db-model";
import { APLRepository } from "./apl-repository";
import { DynamoAPLRepository } from "./dynamo-apl-repository";

export class DynamoAPL implements APL {
  private repository: APLRepository;

  private tracer = getOtelTracer();

  private debug = createDebug("DynamoAPL");

  static create(deps: { table: UsedTable }) {
    return new DynamoAPL({
      repository: new DynamoAPLRepository({
        entity: createAplEntity(deps.table),
      }),
    });
  }

  constructor(deps: { repository: APLRepository }) {
    this.repository = deps.repository;
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    this.debug("get called with saleorApiUrl: %s", saleorApiUrl);
    return this.tracer.startActiveSpan("DynamoAPL.get", async (span) => {
      try {
        const getEntryResult = await this.repository.getEntry({
          saleorApiUrl,
        });

        span
          .setStatus({
            code: SpanStatusCode.OK,
          })
          .end();

        this.debug("get successful for saleorApiUrl: %s", saleorApiUrl);
        return getEntryResult ?? undefined;
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();
        this.debug("get error for saleorApiUrl: %s, error: %O", saleorApiUrl, e);

        throw new Error("GetAuthDataError: Failed to get APL entry");
      }
    });
  }

  async set(authData: AuthData): Promise<void> {
    this.debug("set called with authData for saleorApiUrl: %s", authData.saleorApiUrl);
    return this.tracer.startActiveSpan("DynamoAPL.set", async (span) => {
      try {
        await this.repository.setEntry({
          authData,
        });

        span
          .setStatus({
            code: SpanStatusCode.OK,
          })
          .end();

        this.debug("set successful for saleorApiUrl: %s", authData.saleorApiUrl);
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();
        this.debug("set error for saleorApiUrl: %s, error: %O", authData.saleorApiUrl, e);

        throw new Error("SetAuthDataError: Failed to set APL entry");
      }
    });
  }

  async delete(saleorApiUrl: string): Promise<void> {
    this.debug("delete called with saleorApiUrl: %s", saleorApiUrl);
    return this.tracer.startActiveSpan("DynamoAPL.delete", async (span) => {
      try {
        await this.repository.deleteEntry({
          saleorApiUrl,
        });

        span
          .setStatus({
            code: SpanStatusCode.OK,
          })
          .end();

        this.debug("delete successful for saleorApiUrl: %s", saleorApiUrl);
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();
        this.debug("delete error for saleorApiUrl: %s, error: %O", saleorApiUrl, e);

        throw new Error("DeleteAuthDataError: Failed to set APL entry");
      }
    });
  }

  async getAll(): Promise<AuthData[]> {
    this.debug("getAll called");
    return this.tracer.startActiveSpan("DynamoAPL.getAll", async (span) => {
      try {
        const getAllEntriesResult = await this.repository.getAllEntries();

        span
          .setStatus({
            code: SpanStatusCode.OK,
          })
          .end();

        this.debug("getAll successful, found %d entries", getAllEntriesResult?.length ?? 0);
        return getAllEntriesResult ?? [];
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();
        this.debug("getAll error: %O", e);

        throw new Error("GetAllAuthDataError: Failed to set APL entry");
      }
    });
  }
}
