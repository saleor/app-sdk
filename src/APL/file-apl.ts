import { promises as fsPromises } from "fs";

import { APL, AplReadyResult, AuthData } from "./apl";
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
   *
   * @param {string} fileName
   */
  private async loadDataFromFile(): Promise<AuthData | undefined> {
    debug(`Load auth data from the ${this.fileName} file`);
    let parsedData: Record<string, string> = {};
    try {
      await fsPromises.access(this.fileName);
      parsedData = JSON.parse(await fsPromises.readFile(this.fileName, "utf-8"));
    } catch (err) {
      debug(`Could not read auth data from the ${this.fileName} file`, err);
      throw new Error(`File APL could not read auth data from the ${this.fileName} file`);
    }
    const { token, domain } = parsedData;
    if (token && domain) {
      return { token, domain };
    }
    return undefined;
  }

  /**
   * Save auth data to file.
   * When `authData` argument is empty, will overwrite file with empty values.
   *
   * @param {string} fileName
   * @param {AuthData} [authData]
   */
  private async saveDataToFile(authData?: AuthData) {
    debug(`Save auth data to the ${this.fileName} file`);
    const newData = authData ? JSON.stringify(authData) : "{}";
    try {
      await fsPromises.writeFile(this.fileName, newData);
    } catch (err) {
      debug(`Could not save auth data to the ${this.fileName} file`, err);
      throw new Error("File APL was unable to save auth data");
    }
  }

  async get(domain: string) {
    const authData = await this.loadDataFromFile();
    if (domain === authData?.domain) {
      return authData;
    }
    return undefined;
  }

  async set(authData: AuthData) {
    await this.saveDataToFile(authData);
  }

  async delete(domain: string) {
    const authData = await this.loadDataFromFile();

    if (domain === authData?.domain) {
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
}
