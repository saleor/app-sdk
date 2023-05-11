import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "./apl";
import { GetAllAplResponseShape, SaleorCloudAPL, SaleorCloudAPLConfig } from "./saleor-cloud-apl";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

const aplConfig: SaleorCloudAPLConfig = {
  resourceUrl: "https://example.com",
  token: "token",
};

const stubAuthData: AuthData = {
  domain: "example.com",
  token: "example-token",
  saleorApiUrl: "https://example.com/graphql/",
  appId: "42",
  jwks: "{}",
};

describe("APL", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  describe("SaleorCloudAPL", () => {
    describe("set", () => {
      it("Successful save of the auth data", async () => {
        fetchMock.mockResolvedValue({
          status: 200,
          json: async () => ({ result: "ok" }),
          ok: true,
        });

        const apl = new SaleorCloudAPL(aplConfig);
        await apl.set(stubAuthData);

        expect(fetchMock).toBeCalledWith(
          "https://example.com",

          {
            body: JSON.stringify({
              saleor_app_id: "42",
              saleor_api_url: "https://example.com/graphql/",
              jwks: "{}",
              domain: "example.com",
              token: "example-token",
            }),
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer token",
            },
            method: "POST",
          }
        );
      });

      it("Raise error when register service returns non 200 response", async () => {
        fetchMock.mockResolvedValue({
          status: 500,
          ok: false,
        });

        const apl = new SaleorCloudAPL(aplConfig);

        await expect(apl.set(stubAuthData)).rejects.toThrow(
          "Fetch returned with non 200 status code 500"
        );
      });
    });

    describe("get", () => {
      describe("Read existing auth data", () => {
        it("Read existing auth data", async () => {
          fetchMock.mockResolvedValue({
            status: 200,
            ok: true,
            json: async () => ({
              saleor_app_id: stubAuthData.appId,
              saleor_api_url: stubAuthData.saleorApiUrl,
              jwks: stubAuthData.jwks,
              domain: stubAuthData.domain,
              token: stubAuthData.token,
            }),
          });

          const apl = new SaleorCloudAPL(aplConfig);

          expect(await apl.get(stubAuthData.saleorApiUrl)).toStrictEqual(stubAuthData);

          expect(fetchMock).toBeCalledWith(
            "https://example.com/aHR0cHM6Ly9leGFtcGxlLmNvbS9ncmFwaHFsLw", // base64 encoded api url
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer token",
              },
              method: "GET",
            }
          );
        });

        it("Return undefined when unknown domain requested", async () => {
          fetchMock.mockResolvedValue({
            status: 404,
            ok: false,
            json: async () => undefined,
          });

          const apl = new SaleorCloudAPL(aplConfig);

          expect(await apl.get("http://unknown-domain.example.com/graphql/")).toBe(undefined);
        });
      });
    });

    describe("getAll", () => {
      it("Returns mapped APL arrat", async () => {
        fetchMock.mockResolvedValue({
          status: 200,
          ok: true,
          json: async () => {
            const mockData: GetAllAplResponseShape = {
              count: 2,
              results: [
                {
                  domain: "example.com",
                  jwks: "{}",
                  token: "token1",
                  saleor_api_url: "https://example.com/graphql/",
                  saleor_app_id: "x",
                },
                {
                  domain: "example2.com",
                  jwks: "{}",
                  token: "token2",
                  saleor_api_url: "https://example2.com/graphql/",
                  saleor_app_id: "y",
                },
              ],
            };

            return mockData;
          },
        });

        const apl = new SaleorCloudAPL(aplConfig);

        expect(await apl.getAll()).toStrictEqual([
          {
            appId: "x",
            domain: "example.com",
            jwks: "{}",
            saleorApiUrl: "https://example.com/graphql/",
            token: "token1",
          },
          {
            appId: "y",
            domain: "example2.com",
            jwks: "{}",
            saleorApiUrl: "https://example2.com/graphql/",
            token: "token2",
          },
        ]);
      });
    });
  });
});
