import { CreateAppRegisterHandlerOptions } from "./create-app-register-handler";

export const validateAllowSaleorUrls = (
  saleorApiUrl: string,
  allowedUrls: CreateAppRegisterHandlerOptions["allowedSaleorUrls"]
) => {
  if (!allowedUrls || allowedUrls.length === 0) {
    return true;
  }

  for (const urlOrFn of allowedUrls) {
    if (typeof urlOrFn === "string" && urlOrFn === saleorApiUrl) {
      return true;
    }

    if (typeof urlOrFn === "function" && urlOrFn(saleorApiUrl)) {
      return true;
    }
  }

  return false;
};
