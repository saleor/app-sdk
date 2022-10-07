import { APL } from "./APL";

export interface HasAPL {
  apl: APL;
}

export interface SaleorAppParams {
  apl: APL;
  requiredEnvVars?: string[];
}

export type EnvValidationResult =
  | {
      valid: true;
    }
  | {
      valid: false;
      invalidEnvName: string;
    };

export class SaleorApp implements HasAPL {
  readonly apl: APL;

  readonly requiredEnvVars: string[];

  constructor(options: SaleorAppParams) {
    this.apl = options.apl;
    this.requiredEnvVars = options.requiredEnvVars ?? [];
  }

  validateRequiredEnv(): EnvValidationResult {
    for (const envName of this.requiredEnvVars) {
      const relatedEnv = process.env[envName];

      if (!relatedEnv || relatedEnv.length === 0) {
        return {
          valid: false,
          invalidEnvName: envName,
        };
      }
    }

    return {
      valid: true,
    };
  }
}
