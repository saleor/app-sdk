import {
  FormPayloadUpdateSingleFieldResult,
  TranslationField,
} from "@/app-bridge/form-payload-events/common";

type FormId = "shipping-method-translate";
type Fields = "shippingMethodName" | "shippingMethodDescription" | "seoName" | "seoDescription";

export type FormPayloadShippingMethodTranslate = {
  shippingMethodId: string;
  translationLanguage: string;
  form: FormId;
  fields: Record<Fields, TranslationField>;
};

export type FormPayloadUpdateShippingMethodTranslate = {
  form: FormId;
  closePopup?: boolean;
  fields: Record<Fields, FormPayloadUpdateSingleFieldResult>;
};
