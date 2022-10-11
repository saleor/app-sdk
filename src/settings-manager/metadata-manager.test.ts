import { beforeEach, describe, expect, it, vi } from "vitest";

import { MetadataEntry, MetadataManager } from "./metadata-manager";

const initialEntry = { key: "a", value: "without domain" };

const entryForDomainX = { key: "a__x.com", value: "domain x value" };
const entryForDomainY = { key: "a__y.com", value: "domain y value" };

const metadata = [initialEntry, entryForDomainX, entryForDomainY];

describe("settings-manager", () => {
  describe("metadata-manager", () => {
    const fetchMock = vi.fn(async () => metadata);
    const mutateMock = vi.fn(async (md: MetadataEntry[]) => [...metadata, ...md]);

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("Get method - using cached values", async () => {
      const manager = new MetadataManager({ fetchMetadata: fetchMock, mutateMetadata: mutateMock });
      expect(fetchMock).toBeCalledTimes(0);

      // Fetch should be called just after getting a first value
      expect(await manager.get("a")).toBe(initialEntry.value);
      expect(fetchMock).toBeCalledTimes(1);

      // Calling get method second time should use cached values and not call fetch a second time
      expect(await manager.get("a")).toBe(initialEntry.value);
      expect(fetchMock).toBeCalledTimes(1);

      // Calling get method with different values should also use the cache, since API returns all metadata ot once
      expect(await manager.get("unknown")).toBe(undefined);
      expect(fetchMock).toBeCalledTimes(1);
    });

    it("Get method - return values for chosen domain", async () => {
      const manager = new MetadataManager({ fetchMetadata: fetchMock, mutateMetadata: mutateMock });

      expect(await manager.get("a", "x.com")).toBe(entryForDomainX.value);
      expect(await manager.get("a", "y.com")).toBe(entryForDomainY.value);
      expect(await manager.get("a", "unknown.com")).toBe(undefined);
    });

    it("Set method - return values for chosen domain", async () => {
      const manager = new MetadataManager({ fetchMetadata: fetchMock, mutateMetadata: mutateMock });
      const newEntry = { key: "new", value: "new value" };

      await manager.set(newEntry);
      expect(await manager.get(newEntry.key)).toBe(newEntry.value);
      expect(mutateMock).toBeCalledTimes(1);
      // Set method should populate cache with updated values, so fetch is never called
      expect(fetchMock).toBeCalledTimes(0);
    });
  });
});
