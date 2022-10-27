import { CollectionReference } from "@google-cloud/firestore";

import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "./apl";
import { createAPLDebug } from "./apl-debug";

const debug = createAPLDebug("FirestoreAPL");

export class FirestoreAPL implements APL {
  private firebaseCollection: CollectionReference<AuthData>;

  constructor(firebaseCollection: CollectionReference) {
    this.firebaseCollection = firebaseCollection as CollectionReference<AuthData>;
  }

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
    try {
      await this.isFirestoreConnected();

      return {
        configured: true,
      };
    } catch (e) {
      return {
        configured: false,
        error: new Error("Firestore cant connect to server"),
      };
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async isReady(): Promise<AplReadyResult> {
    try {
      await this.isFirestoreConnected();

      return {
        ready: true,
      };
    } catch (e) {
      return {
        ready: false,
        error: new Error("Firestore cant connect to server"),
      };
    }
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
      debug("Doc not found, will create");
      await this.firebaseCollection.doc().set(authData);
    }
  }

  private getFirstDocWithDomain(domain: string) {
    return this.firebaseCollection
      .where("domain", "==", domain)
      .get()
      .then((docs) => docs.docs[0]);
  }

  /**
   * Check if Firestore connects in 500ms (should be much faster because Firestore should have open socket before
   */
  private async isFirestoreConnected(): Promise<true> {
    const timeout = new Promise((res) => {
      setTimeout(() => res("timeout"), 500);
    });

    const timeoutResult = await Promise.race([
      timeout,
      this.firebaseCollection
        .count()
        .get()
        .then(() => "network"),
    ]);

    switch (timeoutResult) {
      case "network": {
        debug("Firestore responds from network");
        return true;
      }
      case "timeout":
      default: {
        debug("Firestore cant connect to network in 500ms");
        throw new Error("Firestore cant connect to server");
      }
    }
  }
}
