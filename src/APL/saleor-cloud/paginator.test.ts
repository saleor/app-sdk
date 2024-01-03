import { afterEach, describe, expect, it, vi } from "vitest";

import { Paginator } from "./paginator";

const fetchMock = vi.fn();

describe("Paginator", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Returns single page when there is no `next` property", async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      json: async () => ({ count: 1, next: null, previous: null, results: [{ ok: "yes" }] }),
      ok: true,
    });
    const paginator = new Paginator("https://test.com", {}, fetchMock);
    const result = await paginator.fetchAll();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result).toStrictEqual({
      count: 1,
      next: null,
      previous: null,
      results: [{ ok: "yes" }],
    });
  });

  it("Returns all pages when there is `next` property", async () => {
    fetchMock
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          next: "https://test.com?page=2",
          previous: null,
          count: 2,
          results: [{ ok: "1" }],
        }),
        ok: true,
      })
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          next: null,
          previous: "https://test.com?page=1",
          count: 2,
          results: [{ ok: "2" }],
        }),
        ok: true,
      });
    const paginator = new Paginator("https://test.com", {}, fetchMock);
    const result = await paginator.fetchAll();

    expect(fetchMock).toHaveBeenLastCalledWith("https://test.com?page=2", {});
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toStrictEqual({
      count: 2,
      next: null,
      previous: null,
      results: [{ ok: "1" }, { ok: "2" }],
    });
  });
});
