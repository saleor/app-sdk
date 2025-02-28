import { APL } from "./APL";

export interface HasAPL {
  apl: APL;
}

export interface SaleorAppParams {
  apl: APL;
}

export class SaleorApp implements HasAPL {
  readonly apl: APL;

  constructor(options: SaleorAppParams) {
    this.apl = options.apl;
  }
}
