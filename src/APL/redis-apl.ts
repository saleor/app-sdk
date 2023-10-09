import Redis from "ioredis";

import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";

export type RedisAPLClientArgs = {
  client: Redis;
  appApiBaseUrl: string;
};
export type RedisAPLUrlArgs = {
  redisUrl: string;
  appApiBaseUrl: string;
};
/**
 * Redis APL
 * @param redisUrl - in format redis[s]://[[username][:password]@][host][:port][/db-number],
 * so for example redis://alice:foobared@awesome.redis.server:6380
 * For saleor-platform, thats: `redis://redis:6379/2`
 */
export class RedisAPL implements APL {
  private client;

  private appApiBaseUrl;

  constructor(args: RedisAPLClientArgs | RedisAPLUrlArgs) {
    console.log(args)
    if (!args.appApiBaseUrl)
      throw new Error("The RedisAPL requires to know the app api url beforehand");
    this.appApiBaseUrl = args.appApiBaseUrl;

    if ("client" in args && args.client) {
      this.client = args.client;
    } else if ("redisUrl" in args && args.redisUrl) {
      this.client = new Redis(args.redisUrl, { lazyConnect: true });
    } else {
      throw new Error("RedisAPL: No redis url or client defined");
    }
    this.isConfigured().then((v) => console.log("REDIS: CONFIGURED TEST: ", v))
  }

  private prepareKey(saleorApiUrl: string) {
    return `${this.appApiBaseUrl}:${saleorApiUrl}`;
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    try {
      const res = await this.client.get(this.prepareKey(saleorApiUrl));
      const exit = this.client.quit();
      console.log("REDIS: GET: ")
      console.dir(res, { depth: null })
      if (res) {
        const data = JSON.parse(res) as AuthData
        await exit
        return data;
      }
    } catch (e) {
      this.client.quit()
    }
  }

  async set(authData: AuthData): Promise<void> {
    const res = await this.client.set(this.prepareKey(authData.saleorApiUrl), JSON.stringify(authData));
    console.log("REDIS: SET: ", res)
    await this.client.quit();
  }

  async delete(saleorApiUrl: string): Promise<void> {
    const val = await this.client.getdel(this.prepareKey(saleorApiUrl));
    console.log("REDIS: DEL: ", val)
    await this.client.quit();
  }

  async getAll(): Promise<AuthData[]> {
    throw new Error("redisAPL does not support getAll method");
  }

  async isReady(): Promise<AplReadyResult> {
    const res = await this.client.info()
    const ready = !!(res);
    console.log("REDIS: ISREADY: ", res)
    await this.client.quit();
    return { ready: true } as AplReadyResult;
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    const res = await this.client.info()
    const ready = !!(res);
    console.log("REDIS: ISCONF: ", res)
    await this.client.quit();
    return { configured: true } as AplConfiguredResult;
  }
}
