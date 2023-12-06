import { kv } from "@vercel/kv";

import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "../apl";
import { createAPLDebug } from "../apl-debug";

type Params = {
  hashCollectionKey?: string;
};

export class VercelKvApl implements APL {
  private debug = createAPLDebug("VercelKvApl");

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

    try {
      const authData = await kv.hget<string>(this.hashCollectionKey, saleorApiUrl);

      return authData ? (JSON.parse(authData) as AuthData) : undefined;
    } catch (e) {
      this.debug("Failed to get auth data from Vercel KV");
      this.debug(e);

      throw e;
    }
  }

  async set(authData: AuthData): Promise<void> {
    this.debug("Will call Vercel KV to set auth data for %s", authData.saleorApiUrl);

    try {
      await kv.hset(this.hashCollectionKey, {
        [authData.saleorApiUrl]: JSON.stringify(authData),
      });
    } catch (e) {
      this.debug("Failed to set auth data in Vercel KV");
      this.debug(e);

      throw e;
    }
  }

  async delete(saleorApiUrl: string) {
    this.debug("Will call Vercel KV to delete auth data for %s", saleorApiUrl);

    try {
      await kv.hdel(this.hashCollectionKey, saleorApiUrl);
    } catch (e) {
      this.debug("Failed to delete auth data from Vercel KV");
      this.debug(e);

      throw e;
    }
  }

  async getAll() {
    const results = await kv.hgetall<Record<string, string>>(this.hashCollectionKey);

    if (results === null) {
      throw new Error("Missing KV collection, data was never written");
    }

    return Object.values(results).reduce((collectionOfAuthData, item) => {
      const authData = JSON.parse(item) as AuthData;

      return [...collectionOfAuthData, authData];
    }, [] as AuthData[]);
  }

  async isReady(): Promise<AplReadyResult> {
    const configured = this.envVariablesRequiredByKvExist();

    return configured
      ? {
          ready: true,
        }
      : {
          ready: false,
          error: new Error("Missing KV env variables, please link KV storage to your project"),
        };
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    if (!this.envVariablesRequiredByKvExist()) {
      return {
        configured: false,
        error: new Error("Missing KV env variables, please link KV storage to your project"),
      };
    }

    return {
      configured: true,
    };
  }

  private envVariablesRequiredByKvExist() {
    const variables = [
      "KV_URL",
      "KV_REST_API_URL",
      "KV_REST_API_TOKEN",
      "KV_REST_API_READ_ONLY_TOKEN",
      "KV_STORAGE_NAMESPACE",
    ];

    return variables.every((variable) => !!process.env[variable]);
  }
}
