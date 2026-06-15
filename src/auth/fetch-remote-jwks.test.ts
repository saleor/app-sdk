import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchRemoteJwks } from "./fetch-remote-jwks";

describe("fetchRemoteJwks", () => {
  const saleorApiUrl = "https://demo.saleor.io/graphql/";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches JWKS from the URL derived from the Saleor API url and returns the response text", async () => {
    const jwks = JSON.stringify({ keys: [] });
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(jwks, { status: 200 }));

    const result = await fetchRemoteJwks(saleorApiUrl);

    expect(fetchSpy).toHaveBeenCalledWith("https://demo.saleor.io/.well-known/jwks.json");
    expect(result).toBe(jwks);
  });

  it("rethrows when the fetch call fails", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network down"));

    await expect(fetchRemoteJwks(saleorApiUrl)).rejects.toThrow("Network down");
  });
});
