import { createDebug } from "./debug";

const debug = createDebug("getAppId");

type GetAppResponseType = {
  data?: {
    app?: {
      id: string;
      identifier?: string | null;
    };
  };
};

export interface GetAppIdProperties {
  saleorApiUrl: string;
  token: string;
}

export interface AppIdentity {
  id: string;
  /** The `id` from the manifest the app was installed from. */
  identifier: string | null;
}

/** Asks Saleor which app the token belongs to. */
const fetchApp = async (
  { saleorApiUrl, token }: GetAppIdProperties,
  fields: string,
): Promise<GetAppResponseType["data"]> => {
  try {
    const response = await fetch(saleorApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
        {
          app{
            ${fields}
          }
        }
        `,
      }),
    });
    if (response.status !== 200) {
      debug(`Could not get the app ID: Saleor API has response code ${response.status}`);
      return undefined;
    }
    const body = (await response.json()) as GetAppResponseType;
    return body.data;
  } catch (e) {
    debug("Could not get the app ID: %O", e);
    return undefined;
  }
};

export const getAppId = async (props: GetAppIdProperties): Promise<string | undefined> => {
  const data = await fetchApp(props, "id");

  return data?.app?.id;
};

export const getAppIdentity = async (
  props: GetAppIdProperties,
): Promise<AppIdentity | undefined> => {
  const app = (await fetchApp(props, "id identifier"))?.app;

  if (!app?.id) return undefined;

  return { id: app.id, identifier: app.identifier ?? null };
};
