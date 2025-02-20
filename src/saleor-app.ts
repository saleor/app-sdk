import { APL } from "./APL";

export interface HasAPL {
  apl: APL;
}

export interface SaleorAppParams {
  apl: APL;
  requiredEnvVars?: string[];
}

export class SaleorApp implements HasAPL {
  readonly apl: APL;

  readonly requiredEnvVars: string[];

  constructor(options: SaleorAppParams) {
    this.apl = options.apl;
    this.requiredEnvVars = options.requiredEnvVars ?? [];
  }
}
