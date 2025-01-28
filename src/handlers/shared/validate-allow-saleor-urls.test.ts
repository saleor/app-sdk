import { describe, expect, it } from "vitest";

import { validateAllowSaleorUrls } from "./validate-allow-saleor-urls";

const saleorCloudUrlMock = "https://my-shop.saleor.cloud/graphql/";
const onPremiseSaleorUrlMock = "https://my-shop-123.aws-services.com/graphql/";

const saleorCloudRegexValidator = (url: string) => /https:\/\/.*.saleor.cloud\/graphql\//.test(url);

describe("validateAllowSaleorUrls", () => {
  it("Passes any URL if allow list is empty", () => {
    expect(validateAllowSaleorUrls(saleorCloudUrlMock, [])).toBe(true);
    expect(validateAllowSaleorUrls(onPremiseSaleorUrlMock, [])).toBe(true);
  });

  it("Passes only for URL that was exactly matched in provided allow list array", () => {
    expect(validateAllowSaleorUrls(saleorCloudUrlMock, [saleorCloudUrlMock])).toBe(true);
    expect(validateAllowSaleorUrls(onPremiseSaleorUrlMock, [saleorCloudUrlMock])).toBe(false);
  });

  it("Validates against custom function provided to allow list", () => {
    expect(validateAllowSaleorUrls(saleorCloudUrlMock, [saleorCloudRegexValidator])).toBe(true);
    expect(validateAllowSaleorUrls(onPremiseSaleorUrlMock, [saleorCloudRegexValidator])).toBe(
      false
    );
  });

  it("Validates against more than one argument in allow list", () => {
    expect(
      validateAllowSaleorUrls(saleorCloudUrlMock, [
        saleorCloudRegexValidator,
        onPremiseSaleorUrlMock,
      ])
    ).toBe(true);
    expect(
      validateAllowSaleorUrls(onPremiseSaleorUrlMock, [
        saleorCloudRegexValidator,
        onPremiseSaleorUrlMock,
      ])
    ).toBe(true);
  });
});
