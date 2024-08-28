import { createDebug } from "./debug";

const debug = createDebug("verifyAppToken");

type VerifyAppTokenResponeType = {
  data?: {
    appTokenVerify?: {
      valid: boolean;
    };
  };
};

export interface VerifyAppTokenProperties {
  saleorApiUrl: string;
  token: string;
}

export const verifyAppToken = async ({
  saleorApiUrl,
  token,
}: VerifyAppTokenProperties): Promise<boolean | undefined> => {
  try {
    const response = await fetch(saleorApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        mutation appTokenVerify {
          appTokenVerify(token: "${token}"){
            valid
          }
        }
        `,
      }),
    });
    if (response.status !== 200) {
      debug(`Could not verify app token: Saleor API has response code ${response.status}`);
      return undefined;
    }
    const body = (await response.json()) as VerifyAppTokenResponeType;
    return body.data?.appTokenVerify?.valid;
  } catch (e) {
    debug("Could not verify app token: %O", e);
    return undefined;
  }
};
