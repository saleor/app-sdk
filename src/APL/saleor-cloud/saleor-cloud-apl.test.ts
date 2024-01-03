import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "../apl";
import { GetAllAplResponseShape, SaleorCloudAPL, SaleorCloudAPLConfig } from "./saleor-cloud-apl";
import { SaleorCloudAplError } from "./saleor-cloud-apl-errors";

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
      describe("Handles failures on API level", () => {
        it("Throws error if status is 500", async () => {
          fetchMock.mockResolvedValueOnce({
            status: 500,
            ok: false,
            async json() {
              throw new Error();
            },
          });

          const apl = new SaleorCloudAPL(aplConfig);

          try {
            await apl.get(stubAuthData.saleorApiUrl);
          } catch (e) {
            const err = e as SaleorCloudAplError;

            expect(err.code).toEqual("FAILED_TO_REACH_API");
            expect(err).toMatchInlineSnapshot("[SaleorCloudAplError: Api responded with 500]");
          }
        });

        it("Throws error if status is 200 but JSON is malformed", async () => {
          fetchMock.mockResolvedValueOnce({
            status: 200,
            ok: true,
            async json() {
              throw new Error("json error");
            },
          });

          const apl = new SaleorCloudAPL(aplConfig);

          try {
            await apl.get(stubAuthData.saleorApiUrl);
          } catch (e) {
            const err = e as SaleorCloudAplError;

            expect(err.code).toEqual("RESPONSE_BODY_INVALID");
            expect(err).toMatchInlineSnapshot(
              "[SaleorCloudAplError: Cant parse response body: json error]"
            );
          }
        });
      });

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

        it("Uses cache when GET call is called 2nd time and cacheManager is set to Map", async () => {
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

          const apl = new SaleorCloudAPL({
            ...aplConfig,
            experimental: {
              cacheManager: new Map(),
            },
          });

          expect(await apl.get(stubAuthData.saleorApiUrl)).toStrictEqual(stubAuthData);
          expect(await apl.get(stubAuthData.saleorApiUrl)).toStrictEqual(stubAuthData);

          expect(fetchMock).toBeCalledTimes(1);
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
              next: null,
              previous: null,
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

      it("Handles paginated response", async () => {
        fetchMock
          .mockResolvedValueOnce({
            status: 200,
            ok: true,
            json: async () => {
              const mockData: GetAllAplResponseShape = {
                count: 2,
                next: "https://example.com?page=2",
                previous: null,
                results: [
                  {
                    domain: "example.com",
                    jwks: "{}",
                    token: "token1",
                    saleor_api_url: "https://example.com/graphql/",
                    saleor_app_id: "x",
                  },
                ],
              };
              return mockData;
            },
          })
          .mockResolvedValueOnce({
            status: 200,
            ok: true,
            json: async () => {
              const mockData: GetAllAplResponseShape = {
                count: 2,
                next: null,
                previous: "https://example.com?page=1",
                results: [
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
