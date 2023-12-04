import { promises as fsPromises } from "fs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "./apl";
import { FileAPL } from "./file-apl";

const stubAuthData: AuthData = {
  domain: "example.com",
  token: "example-token",
  saleorApiUrl: "https://example.com/graphql/",
  appId: "42",
  jwks: "{}",
};

describe("APL", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("FileAPL", () => {
    describe("get", () => {
      it("Should fallback to 'undefined' if parsing fail fails", async () => {
        vi.spyOn(fsPromises, "readFile").mockResolvedValue("Not a valid JSON");

        const apl = new FileAPL();
        await expect(apl.get(stubAuthData.saleorApiUrl)).resolves.toBe(undefined);
      });

      it("Returns auth data for existing api url", async () => {
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(stubAuthData));

        const apl = new FileAPL();

        expect(await apl.get(stubAuthData.saleorApiUrl)).toStrictEqual(stubAuthData);
      });

      it("Returns auth data if domain and JWKS are missing", async () => {
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(
          JSON.stringify({
            token: stubAuthData.token,
            saleorApiUrl: stubAuthData.saleorApiUrl,
            appId: stubAuthData.appId,
          })
        );

        const apl = new FileAPL();

        expect(await apl.get(stubAuthData.saleorApiUrl)).toStrictEqual({
          token: stubAuthData.token,
          saleorApiUrl: stubAuthData.saleorApiUrl,
          appId: stubAuthData.appId,
        });
      });

      it("Returns undefined for unknown api url", async () => {
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(stubAuthData));

        const apl = new FileAPL();

        expect(await apl.get("unknown-domain.example.com")).toBe(undefined);
      });
    });

    describe("set", () => {
      it("Handle write file errors", async () => {
        const spyWriteFile = vi.spyOn(fsPromises, "writeFile").mockImplementation(() => {
          throw Error("Write error");
        });

        const apl = new FileAPL();

        await expect(apl.set(stubAuthData)).rejects.toThrow(
          "File APL was unable to save auth data"
        );
        expect(spyWriteFile).toBeCalledWith(".saleor-app-auth.json", JSON.stringify(stubAuthData));
      });

      it("Successfully save to file", async () => {
        const spyWriteFile = vi.spyOn(fsPromises, "writeFile").mockResolvedValue();

        const apl = new FileAPL();

        await expect(apl.set(stubAuthData));

        expect(spyWriteFile).toBeCalledWith(".saleor-app-auth.json", JSON.stringify(stubAuthData));
      });
    });

    describe("delete", () => {
      it("Should override file when called with known domain", async () => {
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(stubAuthData));
        const spyWriteFile = vi.spyOn(fsPromises, "writeFile").mockResolvedValue();

        const apl = new FileAPL();

        await apl.delete(stubAuthData.saleorApiUrl);

        expect(spyWriteFile).toBeCalledWith(".saleor-app-auth.json", "{}");
      });

      it("Should not delete data when called with unknown domain", async () => {
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(stubAuthData));

        const spyWriteFile = vi.spyOn(fsPromises, "writeFile").mockResolvedValue();

        const apl = new FileAPL();

        await apl.delete("unknown-domain.example.com");

        expect(spyWriteFile).toBeCalledTimes(0);
      });
    });

    describe("getAll", () => {
      it("Should return list with one item when auth data are existing", async () => {
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(stubAuthData));

        const apl = new FileAPL();

        expect(await apl.getAll()).toStrictEqual([stubAuthData]);
      });

      it("Should return empty list when auth data are empty", async () => {
        vi.spyOn(fsPromises, "readFile").mockResolvedValue("{}");

        const apl = new FileAPL();

        expect(await apl.getAll()).toStrictEqual([]);
      });
    });
  });
});
