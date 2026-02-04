import {
  FormPayloadUpdateSingleFieldResult,
  ProductPayloadBase,
  TranslationField,
} from "@/app-bridge/form-payload-events/common";

type FormId = "product-translate";
type FieldName = "productName" | "productDescription" | "seoName" | "seoDescription";

export type FormPayloadProductTranslate = ProductPayloadBase & {
  translationLanguage: string;
  form: FormId;
  fields: Record<FieldName, TranslationField>;
};

export type FormPayloadUpdateProductTranslate = {
  form: FormId;
  closePopup?: boolean;
  fields: Record<FieldName, FormPayloadUpdateSingleFieldResult>;
};
