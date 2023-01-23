# Settings Manager

Settings managers are used to persist configuration data like API keys, preferences, etc..

## `SettingsValue` interface

Entries in the manager are stored using structure:

```
  key: string;
  value: string;
  domain?: string;
```

For values which should not be migrated during environment cloning (as private keys to payment provider), developer should use domain field to bind it to particular store instance.

## Available methods

- `get: (key: string, domain?: string) => Promise<string | undefined>`
- `set: (settings: SettingsValue[] | SettingsValue) => Promise<void>`

# MetadataManager

Default manager used by app template. Use app metadata as storage. Since app developer can use any GraphQL client, constructor must be parametrized with fetch and mutate functions:

```ts
import { MetadataEntry } from "@saleor/app-sdk/settings-manager";
import { Client } from "urql";

import {
  FetchAppDetailsDocument,
  FetchAppDetailsQuery,
  UpdateAppMetadataDocument,
} from "../generated/graphql";

export async function fetchAllMetadata(client: Client): Promise<MetadataEntry[]> {
  const { error, data } = await client
    .query<FetchAppDetailsQuery>(FetchAppDetailsDocument, {})
    .toPromise();

  return data?.app?.privateMetadata.map((md) => ({ key: md.key, value: md.value })) || [];
}

export async function mutateMetadata(client: Client, metadata: MetadataEntry[]) {
  const { error: mutationError, data: mutationData } = await client
    .mutation(UpdateAppMetadataDocument, {
      id: appId,
      input: metadata,
    })
    .toPromise();

  return (
    mutationData?.updatePrivateMetadata?.item?.privateMetadata.map((md) => ({
      key: md.key,
      value: md.value,
    })) || []
  );
}
```

And create MetadataManager instance:

```ts
const settings = new MetadataManager({
  fetchMetadata: () => fetchAllMetadata(client),
  mutateMetadata: (md) => mutateMetadata(client, md),
});
```

# EncryptedMetadataManager

This manager encrypts add the layer of encryption for all the stored data.
To operate correctly, the encryption key needs to be passed to the constructor:

```ts
new EncryptedMetadataManager({
  encryptionKey: process.env.SECRET_KEY, // secrets should be saved in the environment variables, never in the source code
  fetchMetadata: () => fetchAllMetadata(client),
  mutateMetadata: (metadata) => mutateMetadata(client, metadata),
});
```

Warning: If encryption key won't be passed, the application will exit.
