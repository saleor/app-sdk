import { SpanStatusCode } from "@opentelemetry/api";

import { getOtelTracer } from "@/open-telemetry";

import { APL, AuthData } from "../apl";
import { createAplEntity, UsedTable } from "./apl-db-model";
import { APLRepository } from "./apl-repository";
import { DynamoAPLRepository } from "./dynamo-apl-repository";

type Envs = {
  APL_TABLE_NAME: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
};

export class DynamoAPL implements APL {
  private repository: APLRepository;

  private tracer = getOtelTracer();

  private env: Envs;

  static create(deps: { env: Envs; table: UsedTable }) {
    return new DynamoAPL({
      repository: new DynamoAPLRepository({
        entity: createAplEntity(deps.table),
      }),
      env: deps.env,
    });
  }

  constructor(deps: { env: Envs; repository: APLRepository }) {
    this.env = deps.env;
    this.repository = deps.repository;
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
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

        return getEntryResult ?? undefined;
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();

        throw new Error("GetAuthDataError: Failed to get APL entry");
      }
    });
  }

  async set(authData: AuthData): Promise<void> {
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
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();

        throw new Error("SetAuthDataError: Failed to set APL entry");
      }
    });
  }

  async delete(saleorApiUrl: string): Promise<void> {
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
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();

        throw new Error("DeleteAuthDataError: Failed to set APL entry");
      }
    });
  }

  async getAll(): Promise<AuthData[]> {
    return this.tracer.startActiveSpan("DynamoAPL.getAll", async (span) => {
      try {
        const getAllEntriesResult = await this.repository.getAllEntries();

        span
          .setStatus({
            code: SpanStatusCode.OK,
          })
          .end();

        return getAllEntriesResult ?? [];
      } catch (e) {
        span.setStatus({ code: SpanStatusCode.ERROR }).end();

        throw new Error("GetAllAuthDataError: Failed to set APL entry");
      }
    });
  }
}
