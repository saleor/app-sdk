export interface AuthData {
  domain: string;
  token: string;
  apiUrl: string;
  appId: string;
  jwks: string;
}

export type AplReadyResult =
  | {
      ready: true;
    }
  | {
      ready: false;
      error: Error;
    };

export type AplConfiguredResult =
  | {
      configured: true;
    }
  | {
      configured: false;
      error: Error;
    };

export interface APL {
  get: (apiUrl: string) => Promise<AuthData | undefined>;
  set: (authData: AuthData) => Promise<void>;
  delete: (apiUrl: string) => Promise<void>;
  getAll: () => Promise<AuthData[]>;
  /**
   * Inform that configuration is finished and correct
   */
  isReady: () => Promise<AplReadyResult>;
  isConfigured: () => Promise<AplConfiguredResult>;
}
