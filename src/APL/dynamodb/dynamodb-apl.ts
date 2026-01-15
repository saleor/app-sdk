import { SpanStatusCode } from "@opentelemetry/api";

import { createDebug } from "@/debug";
import { getOtelTracer } from "@/open-telemetry";

import { APL, AuthData } from "../apl";
import { createAplEntity, UsedTable } from "./apl-db-model";
import { APLRepository } from "./apl-repository";
import { DynamoAPLRepository } from "./dynamo-apl-repository";

type ExternalLogger = (message: string, level: "debug" | "error") => void;
export class DynamoAPL implements APL {
  private repository: APLRepository;

  private tracer = getOtelTracer();

  private debug = createDebug("DynamoAPL");

  private externalLogger: ExternalLogger = () => {};

  private log = (message: string, level: "debug" | "error") => {
    this.debug(message);
    this.externalLogger(message, level);
  };

  static create(deps: { table: UsedTable; externalLogger?: ExternalLogger }) {
    return new DynamoAPL({
      repository: new DynamoAPLRepository({
        entity: createAplEntity(deps.table),
      }),
    });
  }

  constructor(deps: { repository: APLRepository; externalLogger?: ExternalLogger }) {
    this.repository = deps.repository;
    if (deps.externalLogger) {
      this.externalLogger = deps.externalLogger;
    }
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    this.log(`get called with saleorApiUrl: ${saleorApiUrl}`, "debug");

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

        this.log(`get successful for saleorApiUrl: ${saleorApiUrl}`, "debug");
        return getEntryResult ?? undefined;
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();
        this.log(
          `get error for saleorApiUrl: ${saleorApiUrl}, error: ${JSON.stringify(e)}`,
          "error",
        );

        throw new Error("GetAuthDataError: Failed to get APL entry", {
          cause: e,
        });
      }
    });
  }

  async set(authData: AuthData): Promise<void> {
    this.log(`set called with authData for saleorApiUrl: ${authData.saleorApiUrl}`, "debug");

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

        this.log(`set successful for saleorApiUrl: ${authData.saleorApiUrl}`, "debug");
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();
        this.log(
          `set error for saleorApiUrl: ${authData.saleorApiUrl}, error: ${JSON.stringify(e)}`,
          "error",
        );

        throw new Error("SetAuthDataError: Failed to set APL entry", {
          cause: e,
        });
      }
    });
  }

  async delete(saleorApiUrl: string): Promise<void> {
    this.log(`delete called with saleorApiUrl: ${saleorApiUrl}`, "debug");

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

        this.log(`delete successful for saleorApiUrl: ${saleorApiUrl}`, "debug");
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();
        this.log(
          `delete error for saleorApiUrl: ${saleorApiUrl}, error: ${JSON.stringify(e)}`,
          "error",
        );

        throw new Error("DeleteAuthDataError: Failed to set APL entry", {
          cause: e,
        });
      }
    });
  }

  async getAll(): Promise<AuthData[]> {
    this.log("getAll called", "debug");

    return this.tracer.startActiveSpan("DynamoAPL.getAll", async (span) => {
      try {
        const getAllEntriesResult = await this.repository.getAllEntries();

        span
          .setStatus({
            code: SpanStatusCode.OK,
          })
          .end();

        this.log(`getAll successful, found ${getAllEntriesResult?.length ?? 0} entries`, "debug");
        return getAllEntriesResult ?? [];
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();
        this.log(`getAll error: ${JSON.stringify(e)}`, "error");

        throw new Error("GetAllAuthDataError: Failed to set APL entry", {
          cause: e,
        });
      }
    });
  }
}
