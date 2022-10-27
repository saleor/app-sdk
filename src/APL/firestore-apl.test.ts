import { Firestore } from "@google-cloud/firestore";
import { describe, expect, it } from "vitest";

import { FirestoreAPL } from "./firestore-apl";

let firestore: Firestore | null = null;

try {
  firestore = new Firestore({
    // @ts-ignore ignore import.meta, TODO
    projectId: import.meta.env.TEST_FIRESTORE_PROJECT_ID,
    credentials: {
      // @ts-ignore ignore import.meta, TODO
      private_key: import.meta.env.TEST_FIRESTORE_PRIVATE_KEY,
      // @ts-ignore ignore import.meta, TODO
      client_email: import.meta.env.TEST_FIRESTORE_CLIENT_EMAIL,
    },
  });
} catch (e) {
  // Omit test
}

describe.runIf(Boolean(firestore))("Firestore APL", async () => {
  // @ts-expect-error
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
