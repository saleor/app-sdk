export type SettingsValue = {
  key: string;
  value: string;
  domain?: string;
};

export type DeleteSettingsValue = {
  key: string;
  domain: string;
};

type DeleteFnSimple = (keys: string | string[]) => Promise<void>;
type DeleteFnWithDomain = (
  keysWithDomain: DeleteSettingsValue | DeleteSettingsValue[]
) => Promise<void>;

export interface SettingsManager {
  get: (key: string, domain?: string) => Promise<string | undefined>;
  set: (settings: SettingsValue[] | SettingsValue) => Promise<void>;
  delete: DeleteFnSimple | DeleteFnWithDomain;
}
