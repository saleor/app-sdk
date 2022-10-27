import { Firestore } from "@google-cloud/firestore";
import { describe, expect, it } from "vitest";

import { FirestoreAPL } from "./firestore-apl";

/**
 * TODO - tsconfig (or other setup) is misconfigured and import meta is not available
 *   in types scope. In runtime its probably injected by Vitest. @fixme
 */

const firebaseTestConfigAvailable =
  // @ts-ignore
  import.meta.env.TEST_FIRESTORE_PROJECT_ID &&
  // @ts-ignore
  import.meta.env.TEST_FIRESTORE_PRIVATE_KEY &&
  // @ts-ignore
  import.meta.env.TEST_FIRESTORE_CLIENT_EMAIL;

const firestore = new Firestore({
  // @ts-ignore ignore import.meta,
  projectId: import.meta.env.TEST_FIRESTORE_PROJECT_ID,
  credentials: {
    // @ts-ignore ignore import.meta,
    private_key: import.meta.env.TEST_FIRESTORE_PRIVATE_KEY,
    // @ts-ignore ignore import.meta,
    client_email: import.meta.env.TEST_FIRESTORE_CLIENT_EMAIL,
  },
});

describe.runIf(Boolean(firebaseTestConfigAvailable))("Firestore APL", async () => {
  const apl = new FirestoreAPL(firestore.collection("apl"));

  it("Sets & gets document", async () => {
    const authData = { domain: "https://foo.bar", token: "asd" };

    await apl.set(authData);

    const document = await apl.get(authData.domain);

    expect(document).toEqual(authData);
  });

  it("Updates document if domain is the same", async () => {
    const authData = { domain: "https://foo.bar", token: "asd" };

    await apl.set(authData);
    await apl.set({ ...authData, token: "changed value" });

    const document = await apl.get(authData.domain);

    expect(document).toEqual({ ...authData, token: "changed value" });
  });

  it("Deletes document", async () => {
    const authData = { domain: "https://foo.bar", token: "asd" };

    await apl.set(authData);

    await apl.delete(authData.domain);

    const document = await apl.get(authData.domain);

    expect(document).not.toBeDefined();
  });

  it("Gets all documents", async () => {
    const authData1 = { domain: "https://foo.bar.baz", token: "asd" };
    const authData2 = { domain: "https://foo.bar.baz.com", token: "asd" };

    await apl.set(authData1);
    await apl.set(authData2);

    const allDocuments = await apl.getAll();

    expect(allDocuments).toEqual(expect.arrayContaining([authData1, authData2]));
  });
});
