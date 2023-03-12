import { describe, expect, it, vi } from "vitest";

import { AuthData } from "./apl";
import { EnvApl } from "./env-apl";

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
  domain: "my-saleor-instance.cloud",
});

describe("EnvAPL", () => {
  it("Constructs when values are provided in constructor", () => {
    const envVars = getMockEnvVars();

    expect(
      new EnvApl({
        env: {
          token: envVars.SALEOR_APP_TOKEN,
          appId: envVars.SALEOR_APP_ID,
          saleorApiUrl: envVars.SALEOR_API_URL,
        },
      })
    ).toBeDefined();
  });

  it("Prints auth data from \"set\" method in stdout if printAuthDataOnRegister set to \"true\"", async () => {
    const envVars = getMockEnvVars();

    vi.spyOn(console, "table");

    await new EnvApl({
      env: {
        token: envVars.SALEOR_APP_TOKEN,
        appId: envVars.SALEOR_APP_ID,
        saleorApiUrl: envVars.SALEOR_API_URL,
      },
      printAuthDataOnRegister: true,
    }).set(getMockAuthData());

    // eslint-disable-next-line no-console
    return expect(console.table).toHaveBeenCalledWith(expect.objectContaining(getMockAuthData()));
  });

  it("Returns authData from constructor in get() and getAll()", async () => {
    const envVars = getMockEnvVars();

    const apl = new EnvApl({
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
});
