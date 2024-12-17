import { kv, VercelKV } from "@vercel/kv";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { AuthData } from "../apl";
import { VercelKvApl } from "./vercel-kv-apl";

vi.mock("@vercel/kv", () => {
  /**
   * Client uses only hash methods
   */
  const mockKv: Pick<VercelKV, "hget" | "hset" | "hdel" | "hgetall"> = {
    hget: vi.fn(),
    hset: vi.fn(),
    hdel: vi.fn(),
    hgetall: vi.fn(),
  };

  return { kv: mockKv };
});

const getMockAuthData = (saleorApiUrl = "https://demo.saleor.io/graphql"): AuthData => ({
  appId: "foobar",
  saleorApiUrl,
  token: "token",
  domain: "domain",
  jwks: "{}",
});

const APP_NAME_NAMESPACE = "test-app";

describe("VercelKvApl", () => {
  beforeEach(() => {
    vi.stubEnv("KV_URL", "https://url.vercel.io");
    vi.stubEnv("KV_REST_API_URL", "https://url.vercel.io");
    vi.stubEnv("KV_REST_API_TOKEN", "test-token");
    vi.stubEnv("KV_REST_API_READ_ONLY_TOKEN", "test-read-token");
    vi.stubEnv("KV_STORAGE_NAMESPACE", APP_NAME_NAMESPACE);
  });

  it("Constructs", () => {
    expect(new VercelKvApl()).toBeDefined();
  });

  it("Fails if envs are missing", () => {
    vi.unstubAllEnvs();

    expect(() => new VercelKvApl()).toThrow();
  });

  describe("get", () => {
    it("returns parsed auth data", async () => {
      (kv.hget as Mock).mockImplementationOnce(async () => getMockAuthData());

      const apl = new VercelKvApl();

      const authData = await apl.get("https://demo.saleor.io/graphql");

      expect(authData).toEqual(getMockAuthData());
    });
  });

  describe("set", () => {
    it("Sets auth data under a namespace provided in env", async () => {
      const apl = new VercelKvApl();

      await apl.set(getMockAuthData());

      expect(kv.hset).toHaveBeenCalledWith(APP_NAME_NAMESPACE, {
        "https://demo.saleor.io/graphql": getMockAuthData(),
      });
    });
  });
});
