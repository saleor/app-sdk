export class SaleorCloudAplError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "SaleorCloudAplError";
  }
}

export const CloudAplError = {
  FAILED_TO_REACH_API: "FAILED_TO_REACH_API",
  RESPONSE_BODY_INVALID: "RESPONSE_BODY_INVALID",
  RESPONSE_NON_200: "RESPONSE_NON_200",
  ERROR_SAVING_DATA: "ERROR_SAVING_DATA",
  ERROR_DELETING_DATA: "ERROR_DELETING_DATA",
};
