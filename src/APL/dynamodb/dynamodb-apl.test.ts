import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthData } from "../apl";
import { DynamoAPL } from "./dynamodb-apl";
import { MemoryAPLRepository } from "./memory-apl-repository";
import { mockedAuthData } from "./mocks/mocked-auth-data";

describe("DynamoAPL", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get auth data if it exists", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    await repository.setEntry({
      authData: mockedAuthData,
    });

    const result = await apl.get(mockedAuthData.saleorApiUrl);

    expect(result).toStrictEqual(mockedAuthData);
  });

  it("should return undefined if auth data does not exist", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    const result = await apl.get(mockedAuthData.saleorApiUrl);

    expect(result).toBeUndefined();
  });

  it("should throw an error if getting auth data fails", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    vi.spyOn(repository, "getEntry").mockReturnValue(
      Promise.reject(new Error("Error getting data")),
    );

    await expect(apl.get(mockedAuthData.saleorApiUrl)).rejects.toThrowErrorMatchingInlineSnapshot(
      "[Error: GetAuthDataError: Failed to get APL entry]",
    );
  });

  it("should set auth data", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    const result = await apl.set(mockedAuthData);

    expect(result).toBeUndefined();

    const getEntryResult = await repository.getEntry({
      saleorApiUrl: mockedAuthData.saleorApiUrl,
    });

    expect(getEntryResult).toStrictEqual(mockedAuthData);
  });

  it("should throw an error if setting auth data fails", async () => {
    const repository = new MemoryAPLRepository();

    vi.spyOn(repository, "setEntry").mockRejectedValue(new Error("Error setting data"));

    const apl = new DynamoAPL({
      repository,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    await expect(apl.set(mockedAuthData)).rejects.toThrowErrorMatchingInlineSnapshot(
      "[Error: SetAuthDataError: Failed to set APL entry]",
    );
  });

  it("should update existing auth data", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    await repository.setEntry({
      authData: mockedAuthData,
    });

    await apl.set({
      saleorApiUrl: mockedAuthData.saleorApiUrl,
      token: mockedAuthData.token,
      appId: mockedAuthData.appId,
    });

    const getEntryResult = await apl.get(mockedAuthData.saleorApiUrl);

    expect(getEntryResult).toStrictEqual({
      saleorApiUrl: mockedAuthData.saleorApiUrl,
      token: mockedAuthData.token,
      appId: mockedAuthData.appId,
    });
  });

  it("should delete auth data", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    await repository.setEntry({
      authData: mockedAuthData,
    });

    await apl.delete(mockedAuthData.saleorApiUrl);

    const getEntryResult = await apl.get(mockedAuthData.saleorApiUrl);

    expect(getEntryResult).toBeUndefined();
  });

  it("should throw an error if deleting auth data fails", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    await expect(
      apl.delete(mockedAuthData.saleorApiUrl),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      "[Error: DeleteAuthDataError: Failed to set APL entry]",
    );
  });

  it("should get all auth data", async () => {
    const repository = new MemoryAPLRepository();
    const secondEntry: AuthData = {
      saleorApiUrl: "https://foo-bar.cloud/graphql/",
      token: mockedAuthData.token,
      appId: mockedAuthData.appId,
    };
    const apl = new DynamoAPL({
      repository,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    await repository.setEntry({
      authData: mockedAuthData,
    });

    await repository.setEntry({
      authData: secondEntry,
    });

    const result = await apl.getAll();

    expect(result).toStrictEqual([mockedAuthData, secondEntry]);
  });

  it("should throw an error if getting all auth data fails", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    vi.spyOn(repository, "getAllEntries").mockRejectedValueOnce(new Error("Error getting data"));

    await expect(apl.getAll()).rejects.toThrowErrorMatchingInlineSnapshot(
      "[Error: GetAllAuthDataError: Failed to set APL entry]",
    );
  });
});
