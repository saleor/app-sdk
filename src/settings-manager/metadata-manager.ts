import { DeleteSettingsValue, SettingsManager, SettingsValue } from "./settings-manager";

export type MetadataEntry = {
  key: string;
  value: string;
};

/**
 * TODO Rename "Callback" suffixes, these are not callbacks
 */
export type FetchMetadataCallback = () => Promise<MetadataEntry[]>;
export type MutateMetadataCallback = (metadata: MetadataEntry[]) => Promise<MetadataEntry[]>;
export type DeleteMetadataCallback = (keys: string[]) => Promise<void>;

const deserializeMetadata = ({ key, value }: MetadataEntry): SettingsValue => {
  // domain specific metadata use convention key__domain, e.g. `secret_key__example.com`
  const [newKey, domain] = key.split("__");

  return {
    key: newKey,
    domain,
    value,
  };
};

const constructDomainSpecificKey = (key: string, domain: string) => [key, domain].join("__");

const serializeSettingsToMetadata = ({ key, value, domain }: SettingsValue): MetadataEntry => {
  // domain specific metadata use convention key__domain, e.g. `secret_key__example.com`
  if (!domain) {
    return { key, value };
  }

  return {
    key: constructDomainSpecificKey(key, domain),
    value,
  };
};

export interface MetadataManagerConfig {
  fetchMetadata: FetchMetadataCallback;
  mutateMetadata: MutateMetadataCallback;
  /**
   * Keep it optional, to avoid breaking changes. If not provided, delete will throw.
   * TODO: Make it required in next major version
   */
  deleteMetadata?: DeleteMetadataCallback;
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

  private deleteMetadata?: DeleteMetadataCallback;

  constructor({ fetchMetadata, mutateMetadata, deleteMetadata }: MetadataManagerConfig) {
    this.fetchMetadata = fetchMetadata;
    this.mutateMetadata = mutateMetadata;
    this.deleteMetadata = deleteMetadata;
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

  /**
   * Typescript doesn't properly infer arguments, so they have to be rewritten explicitly
   */
  async delete(args: DeleteSettingsValue | DeleteSettingsValue[] | string | string[]) {
    if (!this.deleteMetadata) {
      throw new Error(
        "Delete not implemented. Ensure MetadataManager is configured with deleteMetadata param in constructor"
      );
    }

    const argsArray = Array.isArray(args) ? args : [args];
    const keysToDelete = argsArray.map((keyOrDomainPair) => {
      if (typeof keyOrDomainPair === "string") {
        return keyOrDomainPair;
      }
      const { key, domain } = keyOrDomainPair;
      return constructDomainSpecificKey(key, domain);
    });

    await this.deleteMetadata(keysToDelete);

    this.settings = this.settings.filter((setting) => !argsArray.includes(setting.key));
  }
}
