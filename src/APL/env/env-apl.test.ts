import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "../apl";
import { EnvAPL } from "./env-apl";
import { jwksCache } from "./jwks-cache";

const getMockEnvVars = () => ({
  SALEOR_APP_TOKEN: "some-token",
  SALEOR_APP_ID: "app-id",
  SALEOR_API_URL: "https://my-saleor-instance.cloud/graphql/",
});

const getMockAuthData = (): AuthData => ({
  saleorApiUrl: "https://my-saleor-instance.cloud/graphql/",
  appId: "app-id",
  token: "some-token",
  jwks: "{}",
});

describe("EnvAPL", () => {
  beforeEach(() => {
    jwksCache.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Constructs when values are provided in constructor", () => {
    const envVars = getMockEnvVars();

    expect(
      new EnvAPL({
        env: {
          token: envVars.SALEOR_APP_TOKEN,
          appId: envVars.SALEOR_APP_ID,
          saleorApiUrl: envVars.SALEOR_API_URL,
        },
      }),
    ).toBeDefined();
  });

  it("Prints auth data from \"set\" method in stdout if printAuthDataOnRegister set to \"true\"", async () => {
    const envVars = getMockEnvVars();

    vi.spyOn(console, "log");

    const mockAuthData = getMockAuthData();

    await new EnvAPL({
      env: {
        token: envVars.SALEOR_APP_TOKEN,
        appId: envVars.SALEOR_APP_ID,
        saleorApiUrl: envVars.SALEOR_API_URL,
      },
      printAuthDataOnRegister: true,
    }).set(mockAuthData);

    // eslint-disable-next-line no-console
    return expect(console.log).toHaveBeenNthCalledWith(
      2,
      /**
       * Assert stringified values for formatting
       */
      `{
  "saleorApiUrl": "https://my-saleor-instance.cloud/graphql/",
  "appId": "app-id",
  "token": "some-token",
  "jwks": "{}"
}`,
    );
  });

  it("Returns authData from constructor in get() and getAll()", async () => {
    const envVars = getMockEnvVars();

    const apl = new EnvAPL({
      env: {
        token: envVars.SALEOR_APP_TOKEN,
        appId: envVars.SALEOR_APP_ID,
        saleorApiUrl: envVars.SALEOR_API_URL,
      },
      printAuthDataOnRegister: true,
    });

    expect(await apl.get(envVars.SALEOR_API_URL)).toEqual({
      token: envVars.SALEOR_APP_TOKEN,
      appId: envVars.SALEOR_APP_ID,
      saleorApiUrl: envVars.SALEOR_API_URL,
    });

    expect(await apl.getAll()).toEqual([
      {
        token: envVars.SALEOR_APP_TOKEN,
        appId: envVars.SALEOR_APP_ID,
        saleorApiUrl: envVars.SALEOR_API_URL,
      },
    ]);
  });

  it("Stores jwks from set() and returns it in get() merged with env data", async () => {
    const envVars = getMockEnvVars();

    const apl = new EnvAPL({
      env: {
        token: envVars.SALEOR_APP_TOKEN,
        appId: envVars.SALEOR_APP_ID,
        saleorApiUrl: envVars.SALEOR_API_URL,
      },
    });

    await apl.set({
      saleorApiUrl: envVars.SALEOR_API_URL,
      appId: envVars.SALEOR_APP_ID,
      token: envVars.SALEOR_APP_TOKEN,
      jwks: "{\"keys\":[]}",
    });

    expect(await apl.get(envVars.SALEOR_API_URL)).toEqual({
      token: envVars.SALEOR_APP_TOKEN,
      appId: envVars.SALEOR_APP_ID,
      saleorApiUrl: envVars.SALEOR_API_URL,
      jwks: "{\"keys\":[]}",
    });
  });

  it("Returns env-only data when set() is called without jwks", async () => {
    const envVars = getMockEnvVars();

    const apl = new EnvAPL({
      env: {
        token: envVars.SALEOR_APP_TOKEN,
        appId: envVars.SALEOR_APP_ID,
        saleorApiUrl: envVars.SALEOR_API_URL,
      },
    });

    await apl.set({
      saleorApiUrl: envVars.SALEOR_API_URL,
      appId: envVars.SALEOR_APP_ID,
      token: envVars.SALEOR_APP_TOKEN,
    });

    expect(await apl.get(envVars.SALEOR_API_URL)).toEqual({
      token: envVars.SALEOR_APP_TOKEN,
      appId: envVars.SALEOR_APP_ID,
      saleorApiUrl: envVars.SALEOR_API_URL,
    });
  });

  it("Preserves a previously cached jwks when set() is called without jwks", async () => {
    const envVars = getMockEnvVars();

    const apl = new EnvAPL({
      env: {
        token: envVars.SALEOR_APP_TOKEN,
        appId: envVars.SALEOR_APP_ID,
        saleorApiUrl: envVars.SALEOR_API_URL,
      },
    });

    await apl.set({
      saleorApiUrl: envVars.SALEOR_API_URL,
      appId: envVars.SALEOR_APP_ID,
      token: envVars.SALEOR_APP_TOKEN,
      jwks: "cached-jwks",
    });

    await apl.set({
      saleorApiUrl: envVars.SALEOR_API_URL,
      appId: envVars.SALEOR_APP_ID,
      token: envVars.SALEOR_APP_TOKEN,
    });

    expect(await apl.get(envVars.SALEOR_API_URL)).toEqual({
      token: envVars.SALEOR_APP_TOKEN,
      appId: envVars.SALEOR_APP_ID,
      saleorApiUrl: envVars.SALEOR_API_URL,
      jwks: "cached-jwks",
    });
  });

  it("Returns env-only data after the cache TTL elapses", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1));

    const envVars = getMockEnvVars();

    const apl = new EnvAPL({
      env: {
        token: envVars.SALEOR_APP_TOKEN,
        appId: envVars.SALEOR_APP_ID,
        saleorApiUrl: envVars.SALEOR_API_URL,
      },
      cacheTtlMs: 1000,
    });

    await apl.set({
      saleorApiUrl: envVars.SALEOR_API_URL,
      appId: envVars.SALEOR_APP_ID,
      token: envVars.SALEOR_APP_TOKEN,
      jwks: "{\"keys\":[]}",
    });

    vi.advanceTimersByTime(1001);

    expect(await apl.get(envVars.SALEOR_API_URL)).toEqual({
      token: envVars.SALEOR_APP_TOKEN,
      appId: envVars.SALEOR_APP_ID,
      saleorApiUrl: envVars.SALEOR_API_URL,
    });
  });

  it("Clears the cache on delete()", async () => {
    const envVars = getMockEnvVars();

    const apl = new EnvAPL({
      env: {
        token: envVars.SALEOR_APP_TOKEN,
        appId: envVars.SALEOR_APP_ID,
        saleorApiUrl: envVars.SALEOR_API_URL,
      },
    });

    await apl.set({
      saleorApiUrl: envVars.SALEOR_API_URL,
      appId: envVars.SALEOR_APP_ID,
      token: envVars.SALEOR_APP_TOKEN,
      jwks: "{\"keys\":[]}",
    });

    await apl.delete(envVars.SALEOR_API_URL);

    expect(await apl.get(envVars.SALEOR_API_URL)).toEqual({
      token: envVars.SALEOR_APP_TOKEN,
      appId: envVars.SALEOR_APP_ID,
      saleorApiUrl: envVars.SALEOR_API_URL,
    });
  });

  it("Shares the cache across EnvAPL instances", async () => {
    const envVars = getMockEnvVars();
    const env = {
      token: envVars.SALEOR_APP_TOKEN,
      appId: envVars.SALEOR_APP_ID,
      saleorApiUrl: envVars.SALEOR_API_URL,
    };

    const writer = new EnvAPL({ env });
    const reader = new EnvAPL({ env });

    await writer.set({
      ...env,
      jwks: "shared-jwks",
    });

    expect(await reader.get(envVars.SALEOR_API_URL)).toEqual({
      ...env,
      jwks: "shared-jwks",
    });
  });
});
