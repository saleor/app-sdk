import { CollectionReference } from "@google-cloud/firestore";

import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";

const debug = createAPLDebug("FirestoreAPL");

export class FirestoreApl implements APL {
  // eslint-disable-next-line no-useless-constructor
  constructor(private firebaseCollection: CollectionReference<AuthData>) {}

  async delete(domain: string): Promise<void> {
    debug("Attempt to delete auth for domain %s", domain);

    const doc = await this.getFirstDocWithDomain(domain);

    if (doc) {
      await doc.ref.delete();
    }
  }

  get(domain: string): Promise<AuthData | undefined> {
    debug("Attempt to get auth for domain %s", domain);
    return this.getFirstDocWithDomain(domain).then((doc) => doc?.data());
  }

  async getAll(): Promise<AuthData[]> {
    debug("Attempt to get all auth data");

    return this.firebaseCollection
      .get()
      .then((collection) => collection.docs.map((doc) => doc.data()));
  }

  /**
   * This APL is always configured, because it accepts the Collection, which means Client is already defined.
   */
  // eslint-disable-next-line class-methods-use-this
  async isConfigured(): Promise<AplConfiguredResult> {
    return {
      configured: true,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async isReady(): Promise<AplReadyResult> {
    return {
      ready: true,
    };
  }

  async set(authData: AuthData): Promise<void> {
    debug(
      "Attempt to set auth for domain %s and token starting with %s",
      authData.domain,
      authData.token.slice(0, 4)
    );

    const existingDoc = await this.getFirstDocWithDomain(authData.domain);

    if (existingDoc) {
      debug("Doc found, will overwrite");
      await existingDoc.ref.set(authData);
    } else {
      debug("Doc not, will create");
      await this.firebaseCollection.doc().set(authData);
    }
  }

  private getFirstDocWithDomain(domain: string) {
    return this.firebaseCollection
      .where("domain", "==", domain)
      .get()
      .then((docs) => docs.docs[0]);
  }
}
