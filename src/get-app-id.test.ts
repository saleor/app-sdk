import { afterEach, describe, expect, it, vi } from "vitest";

import { getAppId } from "./get-app-id";

describe("getAppId", () => {
  const saleorApiUrl = "https://demo.saleor.io/graphql/";
  const token = "test-token";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the app id from a successful GraphQL response", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ data: { app: { id: "app-id-123" } } }), { status: 200 }),
      );

    const result = await getAppId({ saleorApiUrl, token });

    expect(result).toBe("app-id-123");
    expect(fetchSpy).toHaveBeenCalledWith(
      saleorApiUrl,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }),
      }),
    );
  });

  it("returns undefined when Saleor responds with a non-200 status", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("Forbidden", { status: 403 }));

    await expect(getAppId({ saleorApiUrl, token })).resolves.toBeUndefined();
  });

  it("returns undefined when the response payload does not contain an app id", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), { status: 200 }),
    );

    await expect(getAppId({ saleorApiUrl, token })).resolves.toBeUndefined();
  });

  it("returns undefined when the fetch call throws", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network down"));

    await expect(getAppId({ saleorApiUrl, token })).resolves.toBeUndefined();
  });
});
