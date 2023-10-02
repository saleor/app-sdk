import Redis from "ioredis";

import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";

const debug = createAPLDebug("RedisAPL");

export type RedisAPLClientArgs = {
  client: Redis,
  appApiBaseUrl: string
}
export type RedisAPLUrlArgs = {
  redisUrl: URL
  appApiBaseUrl: string
}
/**
 * Redis APL
 * @param redisUrl - in format redis[s]://[[username][:password]@][host][:port][/db-number],
 * so for example redis://alice:foobared@awesome.redis.server:6380
 * For saleor-platform, thats: `redis://redis:6379/1`
 */
export class RedisAPL implements APL {
  private client;
  private appApiBaseUrl;

  constructor(args: RedisAPLClientArgs | RedisAPLUrlArgs) {
    if (!args.appApiBaseUrl) throw new Error("The RedisAPL requires to know the app api url beforehand");
    this.appApiBaseUrl = args.appApiBaseUrl;

    if (('client' in args) && args.client) {
      this.client = args.client
      debug("RedisAPL: created redis client");
    }
    else if (('redisUrl' in args) && args.redisUrl) {
      let redisUrl = args.redisUrl
      let port, db;

      if (redisUrl.pathname) {
        const parsed_port = parseInt(redisUrl.pathname)
        db = typeof parsed_port === "number" ? parsed_port : undefined
      }
      if (redisUrl.port) {
        const parsed_port = parseInt(redisUrl.port)
        port = typeof parsed_port === "number" ? parsed_port : undefined
      }

      this.client = new Redis({
        port: port,
        host: redisUrl.host,
        username: redisUrl.username,
        password: redisUrl.password,
        db: db,
        lazyConnect: true
      });
      debug("RedisAPL: created redis client");
    }
    else {
      throw new Error("RedisAPL: No redis url or client defined")
    }
  }

  private prepareKey(saleorApiUrl: string) {
    return `${this.appApiBaseUrl}:${saleorApiUrl}`;
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    try {
      const res = await this.client.get(this.prepareKey(saleorApiUrl));
      debug("RedisAPL: get - received: %j", res);
      if (res) {
        await this.client.quit();
        return JSON.parse(res) as AuthData;
      }
      await this.client.quit();
      return undefined;
    } catch (e) {
      await this.client.quit();
      return undefined;
    }
  }

  async set(authData: AuthData): Promise<void> {
    await this.client.set(this.prepareKey(authData.saleorApiUrl), JSON.stringify(authData));
    debug("RedisAPL: set - set sucessfully: %j", authData);
    await this.client.quit();
  }

  async delete(saleorApiUrl: string): Promise<void> {
    const val = await this.client.getdel(this.prepareKey(saleorApiUrl));
    debug("RedisAPL: del - deleted successfuly: %j", val);
    await this.client.quit();
  }

  async getAll(): Promise<AuthData[]> {
    throw new Error("redisAPL does not support getAll method");
  }

  async isReady(): Promise<AplReadyResult> {
    const ready = await this.client.info() ? true : false
    await this.client.quit();
    return { ready: ready } as AplReadyResult;
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    const ready = await this.client.info() ? true : false
    await this.client.quit();
    return { configured: ready } as AplConfiguredResult;
  }
}
