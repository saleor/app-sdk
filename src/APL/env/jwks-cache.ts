import { createAPLDebug } from "../apl-debug";

const debug = createAPLDebug("EnvAPL:jwks-cache");

type CacheEntry = {
  jwks: string;
  expiresAt: number;
};

export class JwksCache {
  private entry: CacheEntry | undefined;

  set(jwks: string, ttlMs: number): void {
    this.entry = {
      jwks,
      expiresAt: Date.now() + ttlMs,
    };
    debug("Stored jwks in cache, expires at %d", this.entry.expiresAt);
  }

  get(): string | undefined {
    if (!this.entry) {
      debug("Cache miss - no entry");
      return undefined;
    }

    if (Date.now() >= this.entry.expiresAt) {
      debug("Cache miss - entry expired");
      this.entry = undefined;
      return undefined;
    }

    debug("Cache hit");
    return this.entry.jwks;
  }

  clear(): void {
    debug("Cache cleared");
    this.entry = undefined;
  }
}

export const jwksCache = new JwksCache();
