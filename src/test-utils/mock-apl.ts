import { vi } from "vitest";

import { APL, AuthData } from "../APL";

type Options = {
  workForApiUrl?: string;
  savedAllAuthData?: AuthData[];
};

/**
 * Test utility used across scenarios to simulate various APL behaviors
 */
export class MockAPL implements APL {
  private readonly options: Options = {
    workForApiUrl: "https://example.com/graphql/",
    savedAllAuthData: [],
  };

  constructor(opts?: Options) {
    this.options = {
      ...this.options,
      ...(opts ?? {}),
    };
  }

  mockJwks = "{}";

  mockToken = "mock-token";

  mockAppId = "mock-app-id";

  resolveDomainFromApiUrl = (apiUrl: string) =>
    apiUrl.replace("/graphql/", "").replace("https://", "");

  async get(saleorApiUrl: string) {
    if (saleorApiUrl === this.options.workForApiUrl) {
      return {
        domain: this.resolveDomainFromApiUrl(saleorApiUrl),
        token: this.mockToken,
        saleorApiUrl,
        appId: this.mockAppId,
        jwks: this.mockJwks,
      };
    }

    return undefined;
  }

  set = vi.fn();

  delete = vi.fn();

  getAll = vi.fn().mockImplementation(async () => this.options.savedAllAuthData);

  isReady = vi.fn().mockImplementation(async () => ({
    ready: true,
  }));

  isConfigured = vi.fn().mockImplementation(async () => ({
    configured: true,
  }));
}
