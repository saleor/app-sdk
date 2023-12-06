import { kv, VercelKV } from "@vercel/kv";

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
   */
  private hashCollectionKey = "saleor-auth-data";

  private KV: VercelKV = kv;

  constructor(options?: Params) {
    // todo - it always fails in app template, works locally
    //
    // try {
    //   // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    //   this.KV = require("@vercel/kv").kv as VercelKV;
    // } catch (err) {
    //   throw new Error("KV not installed. Please install @vercel/kv package");
    // }

    if (!this.envVariablesRequiredByKvExist()) {
      throw new Error("Missing KV env variables, please link KV storage to your project");
    }

    this.hashCollectionKey = options?.hashCollectionKey ?? this.hashCollectionKey;
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    this.debug("Will call Vercel KV to get auth data for %s", saleorApiUrl);

    try {
      const authData = await this.KV.hget<string>(this.hashCollectionKey, saleorApiUrl);

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
      await this.KV.hset(this.hashCollectionKey, {
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
      await this.KV.hdel(this.hashCollectionKey, saleorApiUrl);
    } catch (e) {
      this.debug("Failed to delete auth data from Vercel KV");
      this.debug(e);

      throw e;
    }
  }

  async getAll() {
    const results = await this.KV.hgetall<Record<string, string>>(this.hashCollectionKey);

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
    ];

    return variables.every((variable) => !!process.env[variable]);
  }
}
