import { describe, expect, it, vi } from "vitest";

import { VercelKvApl } from "./vercel-kv-apl";

vi.stubEnv("KV_URL", "https://url.vercel.io");
vi.stubEnv("KV_REST_API_URL", "https://url.vercel.io");
vi.stubEnv("KV_REST_API_TOKEN", "test-token");
vi.stubEnv("KV_REST_API_READ_ONLY_TOKEN", "test-read-token");

describe("VercelKvApl", () => {
  it("Constructs", () => {
    expect(new VercelKvApl()).toBeDefined();
  });
});
