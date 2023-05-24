export type SettingsValue = {
  key: string;
  value: string;
  domain?: string;
};

export type DeleteSettingsValue = {
  key: string;
  domain: string;
};

export interface SettingsManager {
  get: (key: string, domain?: string) => Promise<string | undefined>;
  set: (settings: SettingsValue[] | SettingsValue) => Promise<void>;
  delete: (args: DeleteSettingsValue | DeleteSettingsValue[] | string | string[]) => Promise<void>;
}
