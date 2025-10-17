export const formPayloadUpdateActionName = "formPayloadUpdate";
export const formPayloadEventName = "formPayload";

export type FormPayloadUpdateSingleFieldResult =
  | {
      value: string;
    }
  | {
      errors: Array<{ message: string }>;
    };

// todo maybe redundant? or internface + class
export type BaseFormPayloadUpdatePayload = {
  form: string;
  fields: Record<string, FormPayloadUpdateSingleFieldResult>;
};

// todo maybe class
export type FormPayloadUpdatePayloadProductTranslate = BaseFormPayloadUpdatePayload & {
  form: "product-translate";
  fields: {
    productName: FormPayloadUpdateSingleFieldResult;
    productDescription: FormPayloadUpdateSingleFieldResult;
    seoName: FormPayloadUpdateSingleFieldResult;
    seoDescription: FormPayloadUpdateSingleFieldResult;
  };
};

export type AllFormPayloadUpdatePayloads = FormPayloadUpdatePayloadProductTranslate;

// todo maybe redundant? or internface + class
export type BaseFormPayloadPayload = {
  form: string;
};

type TranslationPayloadBase = {
  translationLanguage: string;
  currentLanguage: string;
  fields: Record<string, TranslationField>;
};

type ProductPayloadBase = {
  productId: string;
};

type TranslationField = {
  fieldName: string;
  originalValue: string;
  translatedValue: string;
  currentValue: string;
  type: "short-text" | "editorjs";
};

// todo maybe class
export type FormPayloadProductTranslate = BaseFormPayloadPayload &
  TranslationPayloadBase &
  ProductPayloadBase & {
    form: "translate-product";
  };

/**
 * Strong-type all forms as union
 */
export type AllFormPayloads = FormPayloadProductTranslate;
