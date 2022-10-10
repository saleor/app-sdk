export type SettingsValue = {
  key: string;
  value: string;
  domain?: string;
};

export interface SettingsManager {
  get: (key: string, domain?: string) => Promise<string | undefined>;
  set: (settings: SettingsValue[] | SettingsValue) => Promise<void>;
}
