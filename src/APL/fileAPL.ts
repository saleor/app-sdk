import debugPkg from "debug";
import { promises as fsPromises } from "fs";

import { APL, AuthData } from "./apl";

const debug = debugPkg.debug("FileAPL");

/**
 * Load auth data from a file and return it as AuthData format.
 * In case of incomplete or invalid data, return `undefined`.
 *
 * @param {string} fileName
 */
export const loadDataFromFile = async (fileName: string): Promise<AuthData | undefined> => {
  debug(`Load auth data from the ${fileName} file`);
  let parsedData: Record<string, string> = {};
  try {
    await fsPromises.access(fileName);
    parsedData = JSON.parse(await fsPromises.readFile(fileName, "utf-8"));
  } catch (err) {
    debug(`Could not read auth data from the ${fileName} file`, err);
    return undefined;
  }
  const { token, domain } = parsedData;
  if (token && domain) {
    return { token, domain };
  }
  return undefined;
};

/**
 * Save auth data to file.
 * When `authData` argument is empty, will overwrite file with empty values.
 *
 * @param {string} fileName
 * @param {AuthData} [authData]
 */
export const saveDataToFile = async (fileName: string, authData?: AuthData) => {
  debug(`Save auth data to the ${fileName} file`);
  const newData = authData ? JSON.stringify(authData) : "{}";
  try {
    await fsPromises.writeFile(fileName, newData);
  } catch (err) {
    debug(`Could not save auth data to the ${fileName} file`, err);
  }
};

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
    this.fileName = config?.fileName || ".auth-data.json";
  }

  async get(domain: string) {
    const authData = await loadDataFromFile(this.fileName);
    if (domain === authData?.domain) {
      return authData;
    }
    return undefined;
  }

  async set(authData: AuthData) {
    await saveDataToFile(this.fileName, authData);
  }

  async delete(domain: string) {
    const authData = await loadDataFromFile(this.fileName);

    if (domain === authData?.domain) {
      await saveDataToFile(this.fileName);
    }
  }

  async getAll() {
    const authData = await loadDataFromFile(this.fileName);

    if (!authData) {
      return [];
    }

    return [authData];
  }
}
