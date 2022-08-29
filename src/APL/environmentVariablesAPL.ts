import { promises as fsPromises } from "fs";
import fetch from "node-fetch";

import { APL, AuthData } from "./apl";

interface IEnvVar {
  key: string;
  value: string;
}

const ENV_FILE_NAME = ".envfile";

const saveDataToFile = async (variables: IEnvVar[]) => {
  let currentEnvVars;
  try {
    await fsPromises.access(ENV_FILE_NAME);
    currentEnvVars = JSON.parse(await fsPromises.readFile(ENV_FILE_NAME, "utf-8"));
  } catch {
    currentEnvVars = {};
  }

  await fsPromises.writeFile(
    ENV_FILE_NAME,
    JSON.stringify({
      ...currentEnvVars,
      ...variables.reduce((acc, cur) => ({ ...acc, [cur.key]: cur.value }), {}),
    })
  );
};

const loadDataFromFile = async () => {
  try {
    await fsPromises.access(ENV_FILE_NAME);
    return JSON.parse(await fsPromises.readFile(ENV_FILE_NAME, "utf-8"));
  } catch {
    return {};
  }
};

const saveDataToVercel = async (variables: IEnvVar[]) => {
  await fetch(process.env.SALEOR_REGISTER_APP_URL as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: process.env.SALEOR_DEPLOYMENT_TOKEN,
      envs: variables.map(({ key, value }) => ({ key, value })),
    }),
  });
};

const loadDataFromVercel = () => process.env;

export const getEnvVars = async () => {
  if (process.env.VERCEL === "1") {
    return loadDataFromVercel();
  }
  return loadDataFromFile();
};

export const setEnvVars = async (variables: IEnvVar[]) => {
  console.debug("Setting environment variables: ", variables);

  if (process.env.VERCEL === "1") {
    await saveDataToVercel(variables);
  } else {
    await saveDataToFile(variables);
  }
};

export const environmentVariablesAPL: APL = {
  get: async (domain) => {
    const env = await getEnvVars();
    if (domain !== env.SALEOR_DOMAIN || !env.SALEOR_AUTH_TOKEN) {
      return undefined;
    }
    return {
      token: env.SALEOR_AUTH_TOKEN,
      domain: env.SALEOR_DOMAIN,
    };
  },
  set: async (authData: AuthData) => {
    await setEnvVars([
      {
        key: "SALEOR_AUTH_TOKEN",
        value: authData.token,
      },
      {
        key: "SALEOR_DOMAIN",
        value: authData.domain,
      },
    ]);
  },
  delete: async (domain: string) => {
    const env = await getEnvVars();

    if (domain !== env.SALEOR_DOMAIN) {
      return;
    }
    await setEnvVars([
      {
        key: "SALEOR_AUTH_TOKEN",
        value: "",
      },
      {
        key: "SALEOR_DOMAIN",
        value: "",
      },
    ]);
  },
  getAll: async () => {
    const env = await getEnvVars();
    if (!env.SALEOR_DOMAIN || !env.SALEOR_AUTH_TOKEN) {
      return [];
    }
    const authData = {
      token: env.SALEOR_AUTH_TOKEN,
      domain: env.SALEOR_DOMAIN,
    };
    return [authData];
  },
};
