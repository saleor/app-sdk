import {
  FormPayloadUpdateSingleFieldResult,
  ProductPayloadBase,
  TranslationField,
} from "@/app-bridge/form-payload-events/common";

export type FormPayloadProductTranslate = ProductPayloadBase & {
  translationLanguage: string;
  form: "product-translate";
  fields: Record<
    "productName" | "productDescription" | "seoName" | "seoDescription",
    TranslationField
  >;
};

export type FormPayloadUpdatePayloadProductTranslate = {
  form: "product-translate";
  closePopup?: boolean;
  fields: {
    productName?: FormPayloadUpdateSingleFieldResult;
    productDescription?: FormPayloadUpdateSingleFieldResult;
    seoName?: FormPayloadUpdateSingleFieldResult;
    seoDescription?: FormPayloadUpdateSingleFieldResult;
  };
};
