import { promises as fsPromises } from "fs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FileAPL, loadDataFromFile, saveDataToFile } from "./fileAPL";

const stubAuthData = {
  domain: "example.com",
  token: "example-token",
};

describe("APL", () => {
  describe("FileAPL", () => {
    describe("get", () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it("Returns auth data for existing domain", async () => {
        vi.spyOn(fsPromises, "access").mockResolvedValue();
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(stubAuthData));

        const apl = new FileAPL();

        expect(await apl.get(stubAuthData.domain)).toStrictEqual(stubAuthData);
      });

      it("Returns undefined for unknown domain", async () => {
        vi.spyOn(fsPromises, "access").mockResolvedValue();
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(stubAuthData));

        const apl = new FileAPL();

        expect(await apl.get("unknown-domain.example.com")).toBe(undefined);
      });
    });

    describe("delete", () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it("Should override file when called with known domain", async () => {
        vi.spyOn(fsPromises, "access").mockResolvedValue();
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(stubAuthData));
        const spyWriteFile = vi.spyOn(fsPromises, "writeFile").mockResolvedValue();

        const apl = new FileAPL();

        await apl.delete(stubAuthData.domain);

        expect(spyWriteFile).toBeCalledWith(".auth-data.json", "{}");
      });

      it("Should not delete data when called with unknown domain", async () => {
        vi.spyOn(fsPromises, "access").mockResolvedValue();
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(stubAuthData));

        const spyWriteFile = vi.spyOn(fsPromises, "writeFile").mockResolvedValue();

        const apl = new FileAPL();

        await apl.delete("unknown-domain.example.com");

        expect(spyWriteFile).toBeCalledTimes(0);
      });
    });

    describe("getAll", () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it("Should return list with one item when auth data are existing", async () => {
        vi.spyOn(fsPromises, "access").mockResolvedValue();
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(stubAuthData));

        const apl = new FileAPL();

        expect(await apl.getAll()).toStrictEqual([stubAuthData]);
      });

      it("Should return empty list when auth data are empty", async () => {
        vi.spyOn(fsPromises, "access").mockResolvedValue();
        vi.spyOn(fsPromises, "readFile").mockResolvedValue("{}");

        const apl = new FileAPL();

        expect(await apl.getAll()).toStrictEqual([]);
      });
    });
  });

  describe("FileAPL utils", () => {
    describe("saveDataToFile", () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it("Save existing auth data to file", async () => {
        const spyWriteFile = vi.spyOn(fsPromises, "writeFile").mockResolvedValue();
        await saveDataToFile("test.json", stubAuthData);

        expect(spyWriteFile).toBeCalledWith("test.json", JSON.stringify(stubAuthData));
      });

      it("Save empty file when no auth data provided", async () => {
        const spyWriteFile = vi.spyOn(fsPromises, "writeFile").mockResolvedValue();
        await saveDataToFile("test.json");
        expect(spyWriteFile).toBeCalledWith("test.json", "{}");
      });

      it("Handle write file errors", async () => {
        const spyWriteFile = vi.spyOn(fsPromises, "writeFile").mockImplementation(() => {
          throw Error("Write error");
        });
        await saveDataToFile("test.json");
        expect(spyWriteFile).toBeCalledWith("test.json", "{}");
      });
    });

    describe("loadDataFromFile", () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it("Load existing auth data", async () => {
        vi.spyOn(fsPromises, "access").mockResolvedValue();
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(stubAuthData));
        expect(await loadDataFromFile("test.json")).toStrictEqual(stubAuthData);
      });

      it("Should return undefined when JSON parse fails", async () => {
        vi.spyOn(fsPromises, "access").mockResolvedValue();
        vi.spyOn(fsPromises, "readFile").mockResolvedValue("Not a valid JSON");
        expect(await loadDataFromFile("test.json")).toBe(undefined);
      });

      it("Should return undefined when auth token is missing", async () => {
        vi.spyOn(fsPromises, "access").mockResolvedValue();
        const stubInvalidAuthData = {
          domain: "example.com",
        };
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(stubInvalidAuthData));
        expect(await loadDataFromFile("test.json")).toBe(undefined);
      });

      it("Should return undefined when domain is missing", async () => {
        vi.spyOn(fsPromises, "access").mockResolvedValue();
        const stubInvalidAuthData = {
          token: "token",
        };
        vi.spyOn(fsPromises, "readFile").mockResolvedValue(JSON.stringify(stubInvalidAuthData));
        expect(await loadDataFromFile("test.json")).toBe(undefined);
      });
    });
  });
});
