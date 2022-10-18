import { SettingsManager, SettingsValue } from "./settings-manager";

export type MetadataEntry = {
  key: string;
  value: string;
};

export type FetchMetadataCallback = () => Promise<MetadataEntry[]>;

export type MutateMetadataCallback = (metadata: MetadataEntry[]) => Promise<MetadataEntry[]>;

const deserializeMetadata = ({ key, value }: MetadataEntry): SettingsValue => {
  // domain specific metadata use convention key__domain, e.g. `secret_key__example.com`
  const [newKey, domain] = key.split("__");

  return {
    key: newKey,
    domain,
    value,
  };
};

const serializeSettingsToMetadata = ({ key, value, domain }: SettingsValue): MetadataEntry => {
  // domain specific metadata use convention key__domain, e.g. `secret_key__example.com`
  if (!domain) {
    return { key, value };
  }

  return {
    key: [key, domain].join("__"),
    value,
  };
};

export interface MetadataManagerConfig {
  fetchMetadata: FetchMetadataCallback;
  mutateMetadata: MutateMetadataCallback;
}

/**
 * Metadata Manager use app metadata to store settings.
 * To minimize network calls, once fetched metadata are cached.
 * Cache invalidation occurs if any value is set.
 *
 *
 */
export class MetadataManager implements SettingsManager {
  private settings: SettingsValue[] = [];

  private fetchMetadata: FetchMetadataCallback;

  private mutateMetadata: MutateMetadataCallback;

  constructor({ fetchMetadata, mutateMetadata }: MetadataManagerConfig) {
    this.fetchMetadata = fetchMetadata;
    this.mutateMetadata = mutateMetadata;
  }

  async get(key: string, domain?: string) {
    if (!this.settings.length) {
      const metadata = await this.fetchMetadata();
      this.settings = metadata.map(deserializeMetadata);
    }

    const setting = this.settings.find((md) => md.key === key && md.domain === domain);
    return setting?.value;
  }

  async set(settings: SettingsValue[] | SettingsValue) {
    let serializedMetadata = [];
    if (Array.isArray(settings)) {
      serializedMetadata = settings.map(serializeSettingsToMetadata);
    } else {
      serializedMetadata = [serializeSettingsToMetadata(settings)];
    }
    // changes should update cache
    const metadata = await this.mutateMetadata(serializedMetadata);
    this.settings = metadata.map(deserializeMetadata);
  }
}
