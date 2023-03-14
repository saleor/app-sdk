import { APL, AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";

const debug = createAPLDebug("EnvAPL");

type AuthDataRequired = Omit<AuthData, "jwks" | "domain">;

type Options = {
  env: Record<keyof AuthDataRequired, string>;
  /**
   * Enable to log auth data to stdout.
   * Do it once to save data in ENV and disable it later.
   */
  printAuthDataOnRegister?: boolean;
};

export class EnvAPL implements APL {
  private defaultOptions: Partial<Options> = {
    printAuthDataOnRegister: false,
  };

  options: Options;

  constructor(options: Options) {
    if (!this.isAuthDataValid(options.env)) {
      // eslint-disable-next-line no-console
      console.warn(
        "EnvAPL constructor not filled with valid AuthData config. Try to install the app with \"printAuthDataOnRegister\" enabled and check console logs"
      );
    }

    this.options = {
      ...this.defaultOptions,
      ...options,
    };
  }

  private isAuthDataValid(authData: AuthData): boolean {
    const keysToValidateAgainst: Array<keyof AuthData> = ["appId", "saleorApiUrl", "token"];

    return keysToValidateAgainst.every(
      (key) => authData[key] && typeof authData[key] === "string" && authData[key]!.length > 0
    );
  }

  async isReady() {
    return this.isAuthDataValid(this.options.env)
      ? ({
          ready: true,
        } as const)
      : {
          ready: false,
          error: new Error("Auth data not valid, check constructor and pass env variables"),
        };
  }

  /**
   * Always return its configured, because otherwise .set() will never be called
   * so env can't be printed
   */
  async isConfigured() {
    return {
      configured: true,
    } as const;
  }

  async set(authData: AuthData) {
    if (this.options.printAuthDataOnRegister) {
      // eslint-disable-next-line no-console
      console.log("Displaying registration values for the app. Use them to configure EnvAPL");
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(authData, null, 2));
      console.warn(
        "🛑'printAuthDataOnRegister' option should be turned off once APL is configured, to avoid possible leaks"
      );
    }
    debug("Called set method");
  }

  async get(saleorApiUrl: string) {
    if (!this.isAuthDataValid(this.options.env)) {
      debug("Trying to get AuthData but APL constructor was not filled with proper AuthData");
      return undefined;
    }

    if (saleorApiUrl !== this.options.env.saleorApiUrl) {
      throw new Error(
        `Requested AuthData for domain "${saleorApiUrl}", however APL is configured for ${this.options.env.saleorApiUrl}. You may trying to install app in invalid Saleor URL `
      );
    }

    return this.options.env;
  }

  async getAll() {
    if (!this.isAuthDataValid(this.options.env)) {
      return [];
    }

    const authData = await this.get(this.options.env.saleorApiUrl);

    return authData ? [authData] : [];
  }

  async delete() {
    debug("Called delete method");
  }
}
