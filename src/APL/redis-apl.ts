import { createClient } from "redis";

import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";

const debug = createAPLDebug("UpstashAPL");

/**
 * Redis APL
 * @param redisUrl - in format redis[s]://[[username][:password]@][host][:port][/db-number],
 * so for example redis://alice:foobared@awesome.redis.server:6380
 * For saleor-platform, thats: `redis://redis:6379/1`
 */
export class RedisAPL implements APL {
  private client;

  private appApiBaseUrl;

  constructor(redisURL: URL, appApiBaseUrl: string) {
    if (!redisURL) throw new Error("No redis url defined");
    if (!appApiBaseUrl) throw new Error("The RedisAPL requires to know the app ID beforehand");
    this.appApiBaseUrl = appApiBaseUrl;
    this.client = createClient({ url: redisURL.toString() });
    debug("RedisAPL: createClient.url : %j", redisURL.toString());
  }

  private prepareKey(saleorApiUrl: string) {
    return `${this.appApiBaseUrl}:${saleorApiUrl}`;
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    await this.client.connect();
    try {
      const res = await this.client.get(this.prepareKey(saleorApiUrl));
      debug("RedisAPL: get - received: %j", res);
      if (res) {
        await this.client.disconnect();
        return JSON.parse(res) as AuthData;
      }
      await this.client.disconnect();
      return undefined;
    } catch (e) {
      await this.client.disconnect();
      return undefined;
    }
  }

  async set(authData: AuthData): Promise<void> {
    await this.client.connect();
    await this.client.set(this.prepareKey(authData.saleorApiUrl), JSON.stringify(authData));
    debug("RedisAPL: set - set sucessfully: %j", authData);
    await this.client.disconnect();
  }

  async delete(saleorApiUrl: string): Promise<void> {
    await this.client.connect();
    const val = await this.client.getDel(this.prepareKey(saleorApiUrl));
    debug("RedisAPL: del - deleted successfuly: %j", val);
    await this.client.disconnect();
  }

  async getAll(): Promise<AuthData[]> {
    throw new Error("redisAPL does not support getAll method");
  }

  async isReady(): Promise<AplReadyResult> {
    return { ready: this.client.isReady } as AplReadyResult;
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    return { configured: this.client.isReady } as AplConfiguredResult;
  }
}
