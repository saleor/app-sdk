import { promises as fsPromises } from "fs";

import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";

const debug = createAPLDebug("FileAPL");

export type FileAPLConfig = {
  fileName?: string;
};

/**
 * File APL
 *
 * The APL store auth data in the json file.
 *
 * Before using this APL, please take in consideration:
 *   - only stores single auth data entry (setting up a new one will overwrite previous values)
 *   - it's not recommended for production use - redeployment of the application will override
 *     existing values, or data persistence will not be guaranteed at all depending on chosen
 *     hosting solution
 *
 */
export class FileAPL implements APL {
  private fileName: string;

  constructor(config: FileAPLConfig = {}) {
    this.fileName = config?.fileName || ".saleor-app-auth.json";
  }

  /**
   * Load auth data from a file and return it as AuthData format.
   * In case of incomplete or invalid data, return `undefined`.
   */
  private async loadDataFromFile(): Promise<AuthData | undefined> {
    debug(`Will try to load auth data from the ${this.fileName} file`);
    let parsedData: Record<string, string> = {};

    try {
      parsedData = JSON.parse(await fsPromises.readFile(this.fileName, "utf-8"));
      debug("%s read successfully", this.fileName);
    } catch (err) {
      debug(`Could not read auth data from the ${this.fileName} file`, err);
      debug(
        "Maybe apl.get() was called before app was registered. Returning empty, fallback data (undefined)"
      );

      return undefined;
    }

    const { token, domain, saleorApiUrl, appId, jwks } = parsedData;

    if (token && saleorApiUrl && appId) {
      debug("Token and domain found, returning values: %s, %s", domain, `${token[0]}***`);

      const authData: AuthData = { token, saleorApiUrl, appId };

      if (jwks) {
        authData.jwks = jwks;
      }

      if (domain) {
        authData.domain = domain;
      }

      return authData;
    }

    return undefined;
  }

  /**
   * Save auth data to file.
   * When `authData` argument is empty, will overwrite file with empty values.
   */
  private async saveDataToFile(authData?: AuthData) {
    debug(`Trying to save auth data to the ${this.fileName} file`);

    const newData = authData ? JSON.stringify(authData) : "{}";

    try {
      await fsPromises.writeFile(this.fileName, newData);

      debug("Successfully written file %", this.fileName);
    } catch (err) {
      debug(`Could not save auth data to the ${this.fileName} file`, err);
      throw new Error("File APL was unable to save auth data");
    }
  }

  async get(saleorApiUrl: string) {
    const authData = await this.loadDataFromFile();
    if (saleorApiUrl === authData?.saleorApiUrl) {
      return authData;
    }
    return undefined;
  }

  async set(authData: AuthData) {
    await this.saveDataToFile(authData);
  }

  async delete(saleorApiUrl: string) {
    const authData = await this.loadDataFromFile();

    if (saleorApiUrl === authData?.saleorApiUrl) {
      await this.saveDataToFile();
    }
  }

  async getAll() {
    const authData = await this.loadDataFromFile();

    if (!authData) {
      return [];
    }

    return [authData];
  }

  // eslint-disable-next-line class-methods-use-this
  async isReady(): Promise<AplReadyResult> {
    /**
     * Assume FileAPL is just ready to use.
     * Consider checking if directory is writable
     */
    return {
      ready: true,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async isConfigured(): Promise<AplConfiguredResult> {
    /**
     * Assume FileAPL is just ready to use.
     * Consider checking if directory is writable
     */
    return {
      configured: true,
    };
  }
}
