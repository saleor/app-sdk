export class SaleorCloudAplError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "SaleorCloudAplError";
  }
}
